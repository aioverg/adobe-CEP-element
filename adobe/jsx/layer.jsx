// 获取当前选中图层的名称
function getActiveLayerName() {
  try {
    if (!app || !app.activeDocument) return "NO_DOCUMENT";
    var doc = app.activeDocument;
    if (!doc.activeLayer) return "NO_LAYER";
    return doc.activeLayer.name;
  } catch (e) {
    return e.toString();
  }
}

// ===== group helpers =====
function _groupsArrayForLayer(layer) {
  var arr = [];
  try {
    if (layer.groupItems && layer.groupItems.length > 0) {
      for (var j = 0; j < layer.groupItems.length; j++) {
        var G = layer.groupItems[j];
        var gname = (typeof G.name === "string" && G.name.length>0) ? G.name : ("<group>" + j + "");
        arr.push({ name: gname, itemCount: (G.pageItems?G.pageItems.length:0), source: "groupItems" });
      }
    }
  } catch (e) {}
  try {
    if (layer.pageItems && layer.pageItems.length > 0) {
      for (var k = 0; k < layer.pageItems.length; k++) {
        try {
          var PI = layer.pageItems[k];
          if (PI && PI.typename === "GroupItem") {
            var pname = (typeof PI.name === "string" && PI.name.length>0) ? PI.name : ("<group_pageitem>" + k);
            arr.push({ name: pname, itemCount: (PI.pageItems?PI.pageItems.length:0), source: "pageItems" });
          }
        } catch(e) {}
      }
    }
  } catch (e) {}
  return arr;
}

// 通用 JSON 序列化（兼容 ExtendScript）
function _toJSON(obj) {
  if (obj === null) return "null";
  var t = typeof obj;
  if (t === "string") return '"' + obj.replace(/"/g, '\\"') + '"';
  if (t === "number" || t === "boolean") return String(obj);
  if (obj instanceof Array) {
    var a = [];
    for (var i = 0; i < obj.length; i++) a.push(_toJSON(obj[i]));
    return "[" + a.join(",") + "]";
  }
  var parts = [];
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) parts.push('"' + k + '":' + _toJSON(obj[k]));
  }
  return "{" + parts.join(",") + "}";
}

// 将 pageItem 转换为纯 JS 对象
function _pageItemToObj(pi) {
  var o = { type: (pi && pi.typename) ? pi.typename : "unknown", name: (pi && pi.name) ? pi.name : "", bounds: null };
  try {
    if (pi && pi.geometricBounds) {
      try { o.bounds = [pi.geometricBounds[0], pi.geometricBounds[1], pi.geometricBounds[2], pi.geometricBounds[3]]; } catch (e) { o.bounds = null; }
    }
    if (!pi) return o;
    switch (pi.typename) {
      case 'PathItem':
        o.pathPoints = (pi.pathPoints?pi.pathPoints.length:0);
        o.closed = !!pi.closed;
        break;
      case 'CompoundPathItem':
        o.pathItems = (pi.pathItems?pi.pathItems.length:0);
        break;
      case 'TextFrame':
        try { o.contents = (pi.contents?pi.contents.toString():""); } catch (e) { o.contents = ""; }
        break;
      case 'GroupItem':
        o.items = [];
        try {
          if (pi.pageItems && pi.pageItems.length > 0) {
            for (var gi = 0; gi < pi.pageItems.length; gi++) {
              o.items.push(_pageItemToObj(pi.pageItems[gi]));
            }
          }
        } catch(e) { }
        break;
      default:
        try { if (pi.pageItems && pi.pageItems.length) o.itemsCount = pi.pageItems.length; } catch(e) {}
    }
  } catch (e) {
    o._error = e.toString();
  }
  return o;
}

// 递归收集层信息（包含子层、groups、pageItems）
function _layerFullToObj(layer) {
  var o = { type: "layer", name: layer.name, childLayers: [], groups: _groupsArrayForLayer(layer), pageItems: [] };
  try {
    if (layer.pageItems && layer.pageItems.length > 0) {
      for (var p = 0; p < layer.pageItems.length; p++) {
        try { o.pageItems.push(_pageItemToObj(layer.pageItems[p])); } catch (e) { o.pageItems.push({ type: 'unknown', _error: e.toString() }); }
      }
    }
    if (layer.layers && layer.layers.length > 0) {
      for (var i = 0; i < layer.layers.length; i++) {
        try { o.childLayers.push(_layerFullToObj(layer.layers[i])); } catch (e) { o.childLayers.push({ name: layer.layers[i] ? layer.layers[i].name : 'unknown', _error: e.toString() }); }
      }
    }
  } catch (e) {
    o._error = e.toString();
  }
  return o;
}

// 返回整个文档结构（包含所有图层、子图层、组、pageItems 等），以 JSON 字符串返回
function getDocumentStructureJSON() {
  try {
    if (!app || !app.activeDocument) return "NO_DOCUMENT";
    var doc = app.activeDocument;
    var res = { name: doc.name, layers: [] };
    if (doc.layers && doc.layers.length > 0) {
      for (var i = 0; i < doc.layers.length; i++) {
        try { res.layers.push(_layerFullToObj(doc.layers[i])); } catch (e) { res.layers.push({ name: doc.layers[i] ? doc.layers[i].name : 'unknown', _error: e.toString() }); }
      }
    }
    return _toJSON(res);
  } catch (e) {
    return e.toString();
  }
}

// 调试组信息（快速输出 counts 和收集到的 groups）
function getActiveLayerGroupsDebug() {
  try {
    if (!app || !app.activeDocument) return "NO_DOCUMENT";
    var layer = app.activeDocument.activeLayer;
    if (!layer) return "NO_LAYER";
    var res = {
      layerName: layer.name,
      groupItemsCount: (layer.groupItems?layer.groupItems.length:0),
      pageItemsCount: (layer.pageItems?layer.pageItems.length:0),
      groups: _groupsArrayForLayer(layer)
    };
    return _toJSON(res);
  } catch (e) {
    return e.toString();
  }
}