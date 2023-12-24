import React, {Component} from 'react';
import {Box, IconButton, withStyles} from "@material-ui/core";
import styles from "./styles";
import {Email as EmailIcon, Phone as PhoneIcon} from "@material-ui/icons";

class AxlSupport extends Component {
  hrefTo(href) {
    if (href === null || href === '') return;

    window.location.href = href;
  }

  render() {
    const {classes, title, phone, email} = this.props;
    const isHide = !(phone || email);

    return isHide ? null : (
      <Box my={3}>
        <Box dangerouslySetInnerHTML={{__html: title}} mb={2} className={classes.title} />
        <Box>
          {phone && (
            <IconButton onClick={() => this.hrefTo(phone)} className={classes.iconButton} color="primary">
              <PhoneIcon className={classes.icon}/>
              <span className={classes.text}>Phone Support</span>
            </IconButton>
          )}
          {email && (
            <IconButton onClick={() => this.hrefTo(email)} className={classes.iconButton} color="primary">
              <EmailIcon className={classes.icon}/>
              <span className={classes.text}>Email Support</span>
            </IconButton>
          )}
        </Box>
      </Box>
    )
  }
}

export default withStyles(styles)(AxlSupport);