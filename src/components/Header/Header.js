import React, { useState } from 'react';
import { Menu as MenuIcon } from '@material-ui/icons';
import { AppBar, Toolbar, IconButton, MenuItem, Menu, withStyles } from '@material-ui/core';

import styles from './styles';

function Header(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const { classes, menuItems, logo } = props;
  const openMobileMenu = Boolean(anchorEl);

  return (
    <div className={classes.grow}>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar>
          <a href="/" className={classes.logo}>
            <img src={logo} alt="AxleHire" className={classes.logoImg} height={52} />
          </a>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            {menuItems && (
              <ul className={classes.mainMenu}>
                {menuItems.map((menuItem, i) => (
                  <li key={`menu-${i}`} className={classes.mainMenuItem}>
                    <a className={`${classes.mainMenuItemLink}${menuItem.isActive ? ' active' : ''}`} href={menuItem.link} target="_blank" rel="noopener noreferrer">
                      {menuItem.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={classes.sectionMobile}>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="open drawer" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MenuIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Menu anchorEl={anchorEl} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} id="primary-search-account-menu-mobile" getContentAnchorEl={null} transformOrigin={{ vertical: 'bottom', horizontal: 'right' }} open={openMobileMenu} onClose={() => setAnchorEl(null)}>
        {menuItems.map((menuItem, i) => (
          <MenuItem key={`mobile-menu-${i}`}>
            <a className={`${classes.mainMenuItemLink}${menuItem.isActive ? ' active' : ''}`} href={menuItem.link} target="_blank" rel="noopener noreferrer">
              {menuItem.title}
            </a>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default withStyles(styles)(Header);
