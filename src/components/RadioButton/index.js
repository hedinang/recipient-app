import React, {Component} from 'react';
import styles from "./styles";
import {Radio, withStyles} from "@material-ui/core";
import clsx from 'clsx';

class RadioButton extends Component {
  render() {
    const {classes} = this.props;
    const cloneProps = {...this.props};
    delete cloneProps.classes;

    return (
      <Radio
        className={classes.root}
        disableRipple
        color="default"
        icon={<span className={classes.icon} />}
        checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
        {...cloneProps}
      />
    )
  }
}

export default withStyles(styles)(RadioButton);