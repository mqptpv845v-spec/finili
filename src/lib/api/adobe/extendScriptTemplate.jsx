// This scripts runs inside Adobe InDesign Server via the Cloud API
// This scripts runs inside Adobe InDesign Server via the Cloud API

var doc = app.activeDocument;
var specs = arguments[0]; // Passed from Node.js (width, height, bleed, etc)

// 1. Resize Document (excluding bleed first)
doc.documentPreferences.pageWidth = specs.dimensions.width_mm + "mm";
doc.documentPreferences.pageHeight = specs.dimensions.height_mm + "mm";

// 2. Set Bleed
doc.documentPreferences.documentBleedUniformSize = true;
doc.documentPreferences.documentBleedTopOffset = specs.bleed_mm + "mm";

// 3. Optional: Recalculate Margins (Safe Zone)
doc.marginPreferences.top = specs.safe_zone_mm + "mm";
doc.marginPreferences.bottom = specs.safe_zone_mm + "mm";
doc.marginPreferences.left = specs.safe_zone_mm + "mm";
doc.marginPreferences.right = specs.safe_zone_mm + "mm";

// 4. Force Liquid Layout Refresh across all pages
for (var i = 0; i < doc.pages.length; i++) {
    var page = doc.pages[i];
    // Re-apply liquid page rules
    if (page.layoutRule !== LayoutRuleOptions.OFF) {
        page.recalculate();
    }
}

// Ensure the preset is correctly configured before export
// (Handled via Adobe API parameters, but could be strictly enforced here)
