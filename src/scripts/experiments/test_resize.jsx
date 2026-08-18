var doc = app.activeDocument;
var dims = [252, 360]; // SvD Helsida
doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;

// Enable Layout Adjustment
doc.layoutAdjustmentPreferences.enableLayoutAdjustment = true;

// Turn on Liquid Layout
for(var i = 0; i < doc.pages.length; i++) {
   // doc.pages[i].layoutRule = LayoutRuleOptions.SCALE;
}

doc.documentPreferences.pageWidth = dims[0];
doc.documentPreferences.pageHeight = dims[1];
