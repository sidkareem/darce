import React from 'react';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import AppAnimate from '../../../@crema/core/AppAnimate';
import Card from '@material-ui/core/Card';
import {Grid} from '@material-ui/core';

const useStyles = makeStyles({});
const Tenant = () => {
  const classes = useStyles();
  return (
    <AppAnimate animation='transition.slideUpIn' delay={200}>
      <Box>
        <Box component='h4' fontSize={20}>
          <Card className={classes.root1}>
            <CardHeader>Header</CardHeader>
            <CardContent>
              <Grid container spacing={4} className={classes.grid}>
                Inside grid
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </AppAnimate>
  );
};

export default Tenant;
