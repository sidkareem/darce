import React from 'react';
import {Box} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

const AppLogoWhite = () => {
  const useStyles = makeStyles(() => ({
    logoRoot: {
      display: 'flex',
      flexDirection: 'row',
      cursor: 'pointer',
      alignItems: 'center',
      marginLeft:94
    },
    logo: {
      height: 50,
      marginRight: 10,
      alignItems: 'center',
     
    },
  }));
  const classes = useStyles();
  return (
    <Box className={classes.logoRoot}>
      <img
        className={classes.logo}
        src={require('assets/images/darwin_white.png')}
        alt='crema-logo'
      />
    </Box>
  );
};

export default AppLogoWhite;
