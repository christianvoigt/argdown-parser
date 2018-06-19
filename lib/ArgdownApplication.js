"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArgdownApplication = void 0;

require("core-js/modules/es6.function.name");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.keys");

var _ArgdownPluginError = require("./ArgdownPluginError");

var _ArgdownTreeWalker = require("./ArgdownTreeWalker");

var _ = _interopRequireWildcard(require("lodash"));

var _Logger = require("./Logger");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

"use strict";

/**
 * An ArgdownApplication chains together a collection of plugins, passing a request and response object between them.
 * Each plugin uses configuration settings from the provided request object to produce or transform data saved in the provided response object.
 * Without any plugins the ArgdownApplication will do nothing. Even the parsing and lexing of Argdown input is accomplished by the [[ParserPlugin]].
 *
 * Plugins are grouped into processors that will be executed after one another each time the [[run]] method is called.
 * Which processors are executed in a run is determined by the request.process list.
 *
 * For each processor ArgdownApplication will try to execute plugin methods in the following order:
 *
 *  - any [[IArgdownPlugin.prepare]] methods: these methods can be used to add plugin default settings to the request
 *    and to check that all required data is present in the response object.
 *  - any event listeners defined in [[IArgdownPlugin.tokenListeners]] and [[IArgdownPlugin.ruleListeners]]. If any plugin in a processor
 *    defines such listeners, an ArgdownTreeWalker will be added to this processor which will visit all nodes in the abstract syntax tree (response.ast).
 *  - any [[IArgdownPlugin.run]] methods: these methods should be used to transform response data not contained within response.ast.
 *
 * All plugin methods called by ArgdownApplication receive a request, response and logger object as parameters.
 * In each of the three rounds the plugins are called in the order they were added to the processor.
 *
 * Most runs will first have to call the ParserPlugin, MetaDataPlugin, ModelPlugin and TagPlugin to add
 * the basic Argdown data to the response object. This includes:
 *
 *  - the AST
 *  - metaData contained in the front matter
 *  - statements and arguments dictionaries
 *  - the relations list
 *  - tag list and tagDictionary
 *  - the sections tree
 *  - metaData of arguments, statements and headings
 *
 * Plugins are expected at the beginning of their prepare method to check for any missing required data in the response object.
 * If required properties are missing, the plugin should throw an [[ArgdownPluginError]].
 * Throwing an error in any of the plugin methods called by ArgdownApplication
 * will cancel the run of the current processor and skip to the next processor.
 * All errors  will be caught, collected and optionally logged by the ArgdownApplication.
 *
 * Plugins should not keep any local mutable state. Instead they should use the request object for configuration
 * and the response object for returning produced or transformed data. The only obvious exceptions are I/O plugins,
 * for example export plugins that save the exported data as new files.
 *
 * The `@argdown/cli` package provides a subclass called `AsyncArgdownApplication` which adds a `AsyncArgdownApplication.runAsync` method to this class.
 * This can be used to support Promises and async/await in I/O operations.
 * The app.runAsync method works exactly like the app.run method
 * except that it tries to call `await plugin.runAsyc(...);` before calling any `plugin.run(...);` methods.
 *
 * @example
 * ```typescript
 *
 * import {ArgdownApplication, IArgdownRequest, IHtmlResponse, ParserPlugin, ModelPlugin, TagPlugin, HtmlExportPlugin} from "@argdown/parser";
 *
 * const app = new ArgdownApplication();
 *
 * const parserPlugin = new ParserPlugin();
 * app.addPlugin(parserPlugin, "parse-input");
 *
 * const modelPlugin = new ModelPlugin();
 * app.addPlugin(modelPlugin, "build-model");
 *
 * const tagPlugin = new TagPlugin();
 * app.addPlugin(tagPlugin, "build-model");
 *
 * const htmlExportPlugin = new HtmlExportPlugin();
 * app.addPlugin(htmlExportPlugin, "export-html");
 *
 * const input = `
 * # My first Argdown document
 *
 * [S1]: a statement
 *    - [A1]: an argument
 * `;
 * const request:IArgdownRequest = {
 *  input,
 *  process: ["parse-input", "build-model", "export-html"],
 *  logLevel: "verbose"
 * }
 * const response:IHtmlResponse = app.run(request);
 * console.log(response.html);
 * ```
 */
var ArgdownApplication =
/*#__PURE__*/
function () {
  /**
   *
   * @param logger optional parameter to provide a logger different from the default one
   */
  function ArgdownApplication(logger) {
    _classCallCheck(this, ArgdownApplication);

    _defineProperty(this, "processors", {});

    _defineProperty(this, "logger", new _Logger.Logger());

    this.processors = {};

    if (logger && _.isFunction(logger.log) && _.isFunction(logger.setLevel)) {
      this.logger = logger;
    }
  }
  /**
   * Adds a plugin to the application.
   * Registers any tokenListeners or ruleListeners with the ArgdownTreeWalker event emitter.
   *
   * @param plugin
   * @param processorId if processorId is undefined, the plugin will be added to the "default" processor
   */


  _createClass(ArgdownApplication, [{
    key: "addPlugin",
    value: function addPlugin(plugin, processorId) {
      if (!processorId) {
        processorId = "default";
      }

      var processor = this.processors[processorId];

      if (!processor) {
        processor = {
          plugins: [],
          walker: null
        };
        this.processors[processorId] = processor;
      }

      processor.plugins.push(plugin);

      if (plugin.tokenListeners || plugin.ruleListeners) {
        if (!processor.walker) {
          processor.walker = new _ArgdownTreeWalker.ArgdownTreeWalker();
        }

        if (plugin.tokenListeners) {
          var _arr = Object.keys(plugin.tokenListeners);

          for (var _i = 0; _i < _arr.length; _i++) {
            var key = _arr[_i];
            processor.walker.addListener(key, plugin.tokenListeners[key]);
          }
        }

        if (plugin.ruleListeners) {
          var _arr2 = Object.keys(plugin.ruleListeners);

          for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
            var _key = _arr2[_i2];
            processor.walker.addListener(_key, plugin.ruleListeners[_key]);
          }
        }
      }
    }
    /**
     * Removes a plugin from the application.
     * Removes all tokenListeners and ruleListeners from the ArgdownTreeWalker event emitter.
     * @param plugin
     * @param processorId
     */

  }, {
    key: "removePlugin",
    value: function removePlugin(plugin, processorId) {
      if (!processorId) {
        processorId = "default";
      }

      var processor = this.processors[processorId];

      if (!processor) {
        return;
      }

      var index = processor.plugins.indexOf(plugin);

      if (index > -1) {
        if (plugin.tokenListeners && processor.walker) {
          var _arr3 = Object.keys(plugin.tokenListeners);

          for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
            var key = _arr3[_i3];
            processor.walker.removeListener(key, plugin.tokenListeners[key]);
          }
        }

        if (plugin.ruleListeners && processor.walker) {
          var _arr4 = Object.keys(plugin.ruleListeners);

          for (var _i4 = 0; _i4 < _arr4.length; _i4++) {
            var _key2 = _arr4[_i4];
            processor.walker.removeListener(_key2, plugin.ruleListeners[_key2]);
          }
        }

        processor.plugins.splice(index, 1);
      }
    }
    /**
     * Get the plugin list of a processor.
     * Careful, this is not a copy!
     *
     * @param processorId
     */

  }, {
    key: "getPlugins",
    value: function getPlugins(processorId) {
      if (!processorId) {
        processorId = "default";
      }

      var processor = this.processors[processorId];
      if (processor) return processor.plugins;else {
        return null;
      }
    }
    /**
     * Get a plugin that is already part of a processor
     * @param name
     * @param processorId
     */

  }, {
    key: "getPlugin",
    value: function getPlugin(name, processorId) {
      var plugins = this.getPlugins(processorId);

      if (plugins) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var plugin = _step.value;

            if (plugin.name == name) {
              return plugin;
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
      }

      return null;
    }
    /**
     * Remove a processor and all its plugins from an application.
     * @param processorId
     */

  }, {
    key: "removeProcessor",
    value: function removeProcessor(processorId) {
      var processor = this.processors[processorId];

      if (!processor) {
        return;
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = processor.plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var plugin = _step2.value;
          this.removePlugin(plugin, processorId);
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

      delete this.processors[processorId];
    }
    /**
     * Execute a chain of processors
     * @param request Use request.process to define the list of processors to run. Use request.input to add ArgdownSourceCode to be processed.
     * @param response Can be optionally used to start with a response from a previous run.
     * Use this if you want to avoid to run processors again that have already done their work.
     * @returns the transformed response object after all plugins have added their data.
     */

  }, {
    key: "run",
    value: function run(request, response) {
      var process = [];
      this.logger.setLevel("error");
      var resp = response || {};

      if (request) {
        if (request.logLevel) {
          this.logger.setLevel(request.logLevel);
        }

        if (request.process) {
          if (_.isArray(request.process)) {
            process = request.process;
          } else if (_.isString(request.process) && request.processes) {
            process = request.processes[request.process];
          }
        }
      }

      if (_.isEmpty(process)) {
        this.logger.log("verbose", "[ArgdownApplication]: No processors to run.");
        return resp;
      }

      var exceptions = [];
      resp.exceptions = exceptions;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = process[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var processorId = _step3.value;
          var cancelProcessor = false;
          var processor = this.processors[processorId];

          if (!processor) {
            this.logger.log("verbose", "[ArgdownApplication]: Processor not found: " + processorId);
            continue;
          }

          this.logger.log("verbose", "[ArgdownApplication]: Running processor: " + processorId);
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = processor.plugins[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var plugin = _step4.value;
              this.logger.log("verbose", "[ArgdownApplication]: Preparing plugin: " + plugin.name);

              if (_.isFunction(plugin.prepare)) {
                try {
                  plugin.prepare(request, resp, this.logger);
                } catch (e) {
                  e.processor = processorId;
                  exceptions.push(e);
                  cancelProcessor = true;
                  this.logger.log("warning", "Processor ".concat(processorId, " canceled."));
                  break;
                }
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          if (cancelProcessor) {
            break;
          } // The tree walk is canceled if any plugin in this processor has thrown an error
          // This is not ideal, but it is better than to remove all listeners of the plugin and then add them back in


          if (resp.ast && processor.walker) {
            try {
              processor.walker.walk(request, resp, this.logger);
            } catch (e) {
              e.processor = processorId;
              exceptions.push(e);
              this.logger.log("warning", "Processor ".concat(processorId, " canceled."));
              break;
            }
          }

          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = processor.plugins[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var _plugin = _step5.value;
              this.logger.log("verbose", "[ArgdownApplication]: Running plugin: " + _plugin.name);

              if (_.isFunction(_plugin.run)) {
                try {
                  var newResponse = _plugin.run(request, resp, this.logger);

                  if (_.isObject(newResponse)) {
                    resp = newResponse;
                  }
                } catch (e) {
                  e.processor = processorId;
                  this.logger.log("warning", "Processor ".concat(processorId, " canceled."));
                  exceptions.push(e);
                  break;
                }
              }
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                _iterator5.return();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }
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

      if (request.logExceptions === undefined || request.logExceptions) {
        for (var _i5 = 0; _i5 < exceptions.length; _i5++) {
          var exception = exceptions[_i5];
          var msg = exception.stack || exception.message;

          if (exception instanceof _ArgdownPluginError.ArgdownPluginError) {
            msg = "[".concat(exception.processor, "/").concat(exception.plugin, "]: ").concat(msg);
          }

          this.logger.log("error", msg);
        }
      }

      return resp;
    }
  }]);

  return ArgdownApplication;
}();

exports.ArgdownApplication = ArgdownApplication;
//# sourceMappingURL=ArgdownApplication.js.map