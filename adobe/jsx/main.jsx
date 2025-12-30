// 获取当前选中图层的名称
function getActiveLayerName() {
    var doc = app.activeDocument;
    return doc.activeLayer;
}