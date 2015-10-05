"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactLibWarning = require("react/lib/warning");

var _reactLibWarning2 = _interopRequireDefault(_reactLibWarning);

var _emitter = require("./emitter");

var _emitter2 = _interopRequireDefault(_emitter);

var _Variant = require("./Variant");

var _Variant2 = _interopRequireDefault(_Variant);

exports["default"] = _react2["default"].createClass({
  displayName: "Pushtell.Experiment",
  propTypes: {
    name: _react2["default"].PropTypes.string.isRequired,
    value: _react2["default"].PropTypes.oneOfType([_react2["default"].PropTypes.string, _react2["default"].PropTypes.func]).isRequired
  },
  win: function win() {
    _emitter2["default"].emitWin(this.props.name);
  },
  getInitialState: function getInitialState() {
    var _this = this;

    var children = {};
    _react2["default"].Children.forEach(this.props.children, function (element) {
      if (!_react2["default"].isValidElement(element) || element.type.displayName !== "Pushtell.Variant") {
        var error = new Error("Pushtell Experiment children must be Pushtell Variant components.");
        error.type = "PUSHTELL_INVALID_CHILD";
        throw error;
      }
      children[element.props.name] = element;
      _emitter2["default"].addExperimentVariant(_this.props.name, element.props.name);
    });
    return {
      variants: children
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value
      });
    }
  },
  componentWillMount: function componentWillMount() {
    var _this2 = this;

    var value = typeof this.props.value === "function" ? this.props.value() : this.props.value;
    if (!this.state.variants[value]) {
      if ("production" !== process.env.NODE_ENV) {
        (0, _reactLibWarning2["default"])(true, 'Experiment “' + this.props.name + '” does not contain variant “' + value + '”');
      }
    }
    _emitter2["default"].setExperimentValue(this.props.name, value);
    _emitter2["default"].emit('play', this.props.name, value);
    this.setState({
      value: value
    });
    this.valueSubscription = _emitter2["default"].addValueListener(this.props.name, function (value) {
      _this2.setState({
        value: value
      });
    });
  },
  componentWillUnmount: function componentWillUnmount() {
    this.valueSubscription.remove();
  },
  render: function render() {
    return this.state.variants[this.state.value] || null;
  }
});
module.exports = exports["default"];