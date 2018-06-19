"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.astToJsonString = exports.astToString = exports.tokenLocationsToString = exports.tokensToString = exports.reduceToMap = exports.getHtmlId = exports.stringToClassName = exports.stringToHtmlId = exports.normalizeLinkText = exports.normalizeLink = exports.validateLink = exports.escapeHtml = void 0;

require("core-js/modules/es6.function.name");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.map");

require("core-js/modules/es6.regexp.replace");

var _modelUtils = require("./model/model-utils");

var mdurl = require("mdurl");

var punycode = require("punycode"); // taken from: https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js


var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};

var replaceUnsafeChar = function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
};

var escapeHtml = function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }

  return str;
}; // taken from https://github.com/markdown-it/markdown-it/blob/master/lib/index.js
////////////////////////////////////////////////////////////////////////////////
//
// This validator can prohibit more than really needed to prevent XSS. It's a
// tradeoff to keep code simple and to be secure by default.
//
// If you need different setup - override validator method as you wish. Or
// replace it with dummy function and use external sanitizer.
//


exports.escapeHtml = escapeHtml;
var BAD_PROTO_WITHOUT_FILE_RE = /^(vbscript|javascript|data):/;
var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

var validateLink = function validateLink(url, allowFile) {
  // url should be normalized at this point, and existing entities are decoded
  var str = url.trim().toLowerCase();
  var proto_re = allowFile ? BAD_PROTO_WITHOUT_FILE_RE : BAD_PROTO_RE;
  return proto_re.test(str) ? GOOD_DATA_RE.test(str) ? true : false : true;
}; ////////////////////////////////////////////////////////////////////////////////


exports.validateLink = validateLink;
var RECODE_HOSTNAME_FOR = ["http:", "https:", "mailto:"];

var normalizeLink = function normalizeLink(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname);
      } catch (er) {
        /**/
      }
    }
  }

  return mdurl.encode(mdurl.format(parsed));
};

exports.normalizeLink = normalizeLink;

var normalizeLinkText = function normalizeLinkText(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toUnicode(parsed.hostname);
      } catch (er) {
        /**/
      }
    }
  }

  return mdurl.decode(mdurl.format(parsed));
}; ////////////////////////////////////////////////////////////////////////////////////
// ARGDOWN Utils


exports.normalizeLinkText = normalizeLinkText;

var stringToHtmlId = function stringToHtmlId(str) {
  var id = str;
  id = id.toLowerCase();
  id = id.replace(/ä/g, "ae");
  id = id.replace(/ö/g, "oe");
  id = id.replace(/ü/g, "ue");
  id = id.replace(/ß/g, "ss");
  id = id.replace(/\s/g, "-");
  id = id.replace(/[^a-z0-9\-]/g, "");
  return id;
};

exports.stringToHtmlId = stringToHtmlId;

var stringToClassName = function stringToClassName(str) {
  return stringToHtmlId(str);
}; /// Returns a html id of the form "type-title".
/// If htmlIdsSet is not null, creates an id that is not already a member of the set.
/// Example: If "statement-s1" is already a member of the set, it will return "statement-s1-occurrence-2".
/// Note that you still have to add the new id to the set yourself if you want to avoid duplicates.


exports.stringToClassName = stringToClassName;

var getHtmlId = function getHtmlId(type, title, htmlIdsSet) {
  var id = type + "-" + title;
  id = stringToHtmlId(id);

  if (htmlIdsSet) {
    var originalId = id;
    var i = 1;

    while (htmlIdsSet[id]) {
      i++;
      id = originalId + "-occurrence-" + i;
    }
  }

  return id;
};

exports.getHtmlId = getHtmlId;

var reduceToMap = function reduceToMap(a, idProvider) {
  return a.reduce(function (acc, curr) {
    acc.set(idProvider(curr), curr);
    return acc;
  }, new Map());
};

exports.reduceToMap = reduceToMap;

var tokensToString = function tokensToString(tokens) {
  var str = "";
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var token = _step.value;

      if (token.tokenType) {
        str += token.tokenType.tokenName + " " + token.image + "\n";
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return str;
};

exports.tokensToString = tokensToString;

var tokenLocationsToString = function tokenLocationsToString(tokens) {
  var str = "";
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = tokens[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var token = _step2.value;

      if (!token.tokenType) {
        continue;
      }

      str += token.tokenType.tokenName + " " + token.image + "\n";
      str += "startOffset: " + token.startOffset + " endOffset: " + token.endOffset + " startLine: " + token.startLine + " endLine: " + token.endLine + " startColumn: " + token.startColumn + " endColumn: " + token.endColumn + "\n\n";
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return str;
};

exports.tokenLocationsToString = tokenLocationsToString;

var astToString = function astToString(ast) {
  return logAstRecursively(ast, "", "");
};

exports.astToString = astToString;

var astToJsonString = function astToJsonString(ast) {
  return JSON.stringify(ast, null, 2);
};

exports.astToJsonString = astToJsonString;

var logAstRecursively = function logAstRecursively(value, pre, str) {
  if (value === undefined) {
    str += "undefined";
    return str;
  } else if ((0, _modelUtils.isTokenNode)(value)) {
    str += value.tokenType.tokenName;
    return str;
  } else if ((0, _modelUtils.isRuleNode)(value)) {
    str += value.name;

    if (value.children && value.children.length > 0) {
      var nextPre = pre + " |";
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = value.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var child = _step3.value;
          str += "\n" + nextPre + "__";
          str = logAstRecursively(child, nextPre, str);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      str += "\n" + pre;
    }
  }

  return str;
};
//# sourceMappingURL=utils.js.map