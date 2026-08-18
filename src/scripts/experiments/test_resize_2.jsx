try {
    var doc = app.activeDocument;
    
    // Scale everything
    for(var i=0; i<doc.pages.length; i++) {
        var p = doc.pages[i];
        p.layoutRule = LayoutRuleOptions.SCALE;
        
        // Use a different resize method that might be more stable
        var bounds = p.bounds; // [Y1, X1, Y2, X2]
        var oldHeight = bounds[2] - bounds[0];
        var oldWidth = bounds[3] - bounds[1];
        
        var newWidth = 252; // DN halvsida
        var newHeight = 180;
        
        // Try resizing the page elements directly instead of the page object itself if page.resize fails
        p.resize(CoordinateSpaces.INNER_COORDINATES, AnchorPoint.CENTER_ANCHOR, ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH, [newWidth, newHeight]);
    }
} catch(e) {
    $.writeln("Error: " + e);
}
