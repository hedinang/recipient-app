import React, {Component} from 'react';
import styles from "./styles";
import {Box, Button, withStyles} from "@material-ui/core";
import clsx from 'clsx';

class ButtonSelectBox extends Component {
  handleClick = (value) => (e) => {
    const {onChange} = this.props;
    onChange(value);
  }

  render() {
    const {classes, title, options, value} = this.props;

    return (
      <Box mb={3}>
        <Box pb={2}><strong>{title}</strong></Box>
        {options.map((opt) => {
          const props = {
            variant: "outlined"
          };

          if (value === opt.value) {
            props['color'] = "primary";
          }

          return <Box pb={1}>
            <Button onClick={this.handleClick(opt.value)} {...props} className={clsx(classes.button, classes.dialogButton, classes.optButton)}>
              {opt.label}
            </Button>            
          </Box>})}                
      </Box> 
    )
  }
}

export default withStyles(styles)(ButtonSelectBox);