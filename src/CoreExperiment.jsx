import React, {Component} from 'react';
import PropTypes from 'prop-types';
import warning from 'fbjs/lib/warning';
import emitter from "./emitter";
import Variant from "./Variant";

export default class CoreExperiment extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ]).isRequired
  };

  win = () => {
    emitter.emitWin(this.props.name);
  };

  state = {};

  displayName = "Pushtell.CoreExperiment";

  constructor(props) {
    super();

    let children = {};
    React.Children.forEach(props.children, element => {
      if (!React.isValidElement(element) || element.type.displayName !== "Pushtell.Variant") {
        let error = new Error("Pushtell Experiment children must be Pushtell Variant components.");
        error.type = "PUSHTELL_INVALID_CHILD";
        throw error;
      }
      children[element.props.name] = element;
      emitter.addExperimentVariant(props.name, element.props.name);
    });
    emitter.emit("variants-loaded", props.name);
    this.state.variants = children;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value || nextProps.children !== this.props.children) {
      let value = typeof nextProps.value === "function" ? nextProps.value() : nextProps.value;
      let children = {};
      React.Children.forEach(nextProps.children, element => {
        children[element.props.name] = element;
      });
      this.setState({
        value: value,
        variants: children
      });
    }
  }

  componentWillMount() {
    let value = typeof this.props.value === "function" ? this.props.value() : this.props.value;
    if (!this.state.variants[value]) {
      if ("production" !== process.env.NODE_ENV) {
        warning(true, 'Experiment “' + this.props.name + '” does not contain variant “' + value + '”');
      }
    }
    emitter._incrementActiveExperiments(this.props.name);
    emitter.setActiveVariant(this.props.name, value);
    emitter._emitPlay(this.props.name, value);
    this.setState({
      value: value
    });
    this.valueSubscription = emitter.addActiveVariantListener(this.props.name, (experimentName, variantName) => {
      this.setState({
        value: variantName
      });
    });
  }

  componentWillUnmount() {
    emitter._decrementActiveExperiments(this.props.name);
    this.valueSubscription.remove();
  }

  render() {
    console.log(this.props.forcedVariant);
    console.log(this.state.value);
    console.log(this.state.variants);
    return this.state.variants[this.props.forcedVariant || this.state.value] || null;
  }
};
