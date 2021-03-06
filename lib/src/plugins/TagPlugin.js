"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _utils = require("../utils.js");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TagPlugin = function () {
    function TagPlugin(config) {
        _classCallCheck(this, TagPlugin);

        var defaultSettings = {
            colorScheme: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"]
        };
        this.defaults = _.defaultsDeep({}, config, defaultSettings);
        this.name = "TagPlugin";
        this.config = config;
    }

    _createClass(TagPlugin, [{
        key: "getSettings",
        value: function getSettings(request) {
            if (!request.tagPlugin) {
                request.tagPlugin = {};
            }
            return request.tagPlugin;
        }
    }, {
        key: "prepare",
        value: function prepare(request) {
            var settings = this.getSettings(request);
            _.defaultsDeep(settings, this.defaults);
            if (request.tagColorScheme) {
                settings.colorScheme = request.tagColorScheme;
            }
            if (request.tags) {
                settings.tags = request.tags;
            }
        }
    }, {
        key: "run",
        value: function run(request, response) {
            if (!response.tags || !response.statements || !response.arguments) {
                return;
            }
            response.tagsDictionary = {};

            var selectedTags = response.tags;
            var settings = this.getSettings(request);
            if (settings.tags) {
                selectedTags = [];
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = settings.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var tagData = _step.value;

                        selectedTags.push(tagData.tag);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = response.tags[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var tag = _step2.value;

                    var _tagData = null;
                    if (settings.tags) {
                        var tagConfig = _.find(request.tags, { tag: tag });
                        _tagData = _.clone(tagConfig);
                    }
                    if (!_tagData) {
                        _tagData = { tag: tag };
                    }
                    response.tagsDictionary[tag] = _tagData;
                    var index = selectedTags.indexOf(tag);
                    _tagData.cssClass = _utils2.default.stringToClassName("tag-" + tag);
                    if (index > -1) {
                        if (!_tagData.color && index < settings.colorScheme.length) {
                            _tagData.color = settings.colorScheme[index];
                        }
                        _tagData.cssClass += " tag" + index;
                        _tagData.index = index;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = Object.keys(response.statements)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var title = _step3.value;

                    var equivalenceClass = response.statements[title];
                    if (equivalenceClass.tags) {
                        equivalenceClass.sortedTags = this.sortTags(equivalenceClass.tags, response);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = Object.keys(response.arguments)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _title = _step4.value;

                    var argument = response.arguments[_title];
                    if (argument.tags) {
                        argument.sortedTags = this.sortTags(argument.tags, response);
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: "sortTags",
        value: function sortTags(tags, response) {
            var filtered = _.filter(tags, function (tag) {
                return response.tagsDictionary[tag].index != null;
            });
            var sorted = _.sortBy(filtered, function (tag) {
                return response.tagsDictionary[tag].index;
            });
            return sorted;
        }
    }]);

    return TagPlugin;
}();

module.exports = {
    TagPlugin: TagPlugin
};
//# sourceMappingURL=TagPlugin.js.map