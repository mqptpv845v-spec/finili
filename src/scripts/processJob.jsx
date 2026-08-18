// processJob.jsx
// This script is executed inside Adobe InDesign via AppleScript.
// It receives arguments as a JSON string.

#target "InDesign"

function decodeBase64(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }
    // Simple UTF8 decode
    var utftext = "";
    var c = 0, c2 = 0, c3 = 0;
    var j = 0;
    while (j < output.length) {
        c = output.charCodeAt(j);
        if (c < 128) {
            utftext += String.fromCharCode(c);
            j++;
        } else if ((c > 191) && (c < 224)) {
            c2 = output.charCodeAt(j + 1);
            utftext += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            j += 2;
        } else {
            c2 = output.charCodeAt(j + 1);
            c3 = output.charCodeAt(j + 2);
            utftext += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            j += 3;
        }
    }
    // Return raw raw output for basic ExtendScript compatibility if utf fail
    return output;
}

function main() {
    try {
        // Suppress all dialogs (missing fonts, missing links, etc) that block execution
        var originalInteractionLevel = app.scriptPreferences.userInteractionLevel;
        app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

        // Find the base64 arguments passed to the script
        var b64Str = app.scriptArgs.getValue("jobArgsBase64");
        if (!b64Str) {
            app.scriptPreferences.userInteractionLevel = originalInteractionLevel;
            return "ERROR: No arguments provided to script Args 'jobArgsBase64'.";
        }

        // Decode string 
        var argsStr = decodeBase64(b64Str);

        // Parse JSON 
        var params;
        try {
            params = JSON.parse(argsStr);
        } catch (e) {
            // Fallback for older ExtendScript
            params = eval("(" + argsStr + ")");
        }

        var masterPath = params.masterPath;
        var outputPath = params.outputPath;
        var campaignText = params.campaignText || "Default Campaign";
        var specs = params.specs || {};

        // Open the document VISIBLY. 
        // Invisible documents often hang the AppleScript bridge during PDF Export in InDesign CC.
        var doc = app.open(File(masterPath), true);

        // --- PHASE 2: DYNAMIC RESIZING ---
        if (specs.dimensions) {
            var dims = specs.dimensions;

            // Zero out margins to prevent "Data is out of range" when shrinking the page
            doc.marginPreferences.properties = {top: 0, left: 0, bottom: 0, right: 0};
            for (var p = 0; p < doc.pages.length; p++) {
                doc.pages[p].marginPreferences.properties = {top: 0, left: 0, bottom: 0, right: 0};
            }
            try {
                for (var ms = 0; ms < doc.masterSpreads.length; ms++) {
                    for (var msp = 0; msp < doc.masterSpreads[ms].pages.length; msp++) {
                        doc.masterSpreads[ms].pages[msp].marginPreferences.properties = {top: 0, left: 0, bottom: 0, right: 0};
                    }
                }
            } catch(e) {}
            
            // To make InDesign actually scale the content when changing page size:
            // Set units based on spec type
            var newWidth = 0;
            var newHeight = 0;
            if (dims.width_mm) {
                doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
                doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
                newWidth = dims.width_mm;
                newHeight = dims.height_mm;
            } else if (dims.width_px) {
                doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.PIXELS;
                doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.PIXELS;
                newWidth = dims.width_px;
                newHeight = dims.height_px;
            }

            // Apply resize to pages directly to trigger Liquid Layout rules
            for (var p = 0; p < doc.pages.length; p++) {
                try {
                    // Force the page to use Scale as its liquid layout rule
                    if (doc.pages[p].hasOwnProperty('layoutRule')) {
                        try { doc.pages[p].layoutRule = LayoutRuleOptions.SCALE; } catch(e){}
                    }

                    doc.pages[p].resize(
                        CoordinateSpaces.INNER_COORDINATES,
                        AnchorPoint.CENTER_ANCHOR,
                        ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
                        [newWidth, newHeight]
                    );
                } catch(e) {
                    // Fallback to old documentPreferences method if resize fails
                    doc.documentPreferences.pageWidth = newWidth;
                    doc.documentPreferences.pageHeight = newHeight;
                }
            }

            // Set bleed if specified
            if (specs.bleed_mm !== undefined) {
                doc.documentPreferences.documentBleedTopOffset = specs.bleed_mm;
                doc.documentPreferences.documentBleedBottomOffset = specs.bleed_mm;
                doc.documentPreferences.documentBleedInsideOrLeftOffset = specs.bleed_mm;
                doc.documentPreferences.documentBleedOutsideOrRightOffset = specs.bleed_mm;
            }
        }

        // --- PHASE 2: TARGETED TEXT REPLACEMENT ---
        var replaced = false;

        // Approach 1: By Script Label (Prioritized)
        // We look for 'KAMPANJTEXT' specifically as discussed for Phase 2, case-insensitive
        try {
            var items = doc.allPageItems;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item instanceof TextFrame && item.label && item.label.toLowerCase() === "kampanjtext") {
                    item.contents = campaignText;
                    replaced = true;
                }
            }
        } catch(e) { }

        // Approach 2: Backward Compatibility / Fallback
        if (!replaced) {
            for (var j = 0; j < doc.textFrames.length; j++) {
                var tfFallback = doc.textFrames[j];
                if (tfFallback.label === "KAMPANJTEXT_HÄR") {
                    tfFallback.contents = campaignText;
                    replaced = true;
                }
            }
        }

        // Approach 3: Last resort - first text frame
        if (!replaced && doc.textFrames.length > 0) {
            doc.textFrames[0].contents = campaignText;
        }

        // Export to PDF
        // Now that outputPath is correctly passed via the JSON bridge, exportFile should work properly.
        var pdfPreset = app.pdfExportPresets.firstItem();
        var outputFile = new File(outputPath);

        doc.exportFile(ExportFormat.PDF_TYPE, outputFile, false, pdfPreset);

        // Close without saving
        doc.close(SaveOptions.NO);

        // Restore interaction level
        app.scriptPreferences.userInteractionLevel = originalInteractionLevel;

        return "SUCCESS:" + outputPath;

    } catch (err) {
        // Restore interaction level on crash too
        try { app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL; } catch (e) { }

        // Return error as string
        return "ERROR: " + err.message + " (Line " + err.line + ")";
    }
}

var result = main();
result; // InDesign returns the last evaluated statement to AppleScript
