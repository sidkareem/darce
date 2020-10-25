import React from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import FilterListIcon from '@material-ui/icons/FilterList';
import SimpleSelect from '../Pages/cards/UI/dropDown/dropDown';
import TimeDrop from '../Pages/cards/UI/dropDown/dropdown_time';
//import SearchBar from '../../../@crema/core/SearchBar';
//import Badge from '../../../@crema/core/Badge/index';
import CalcCard from './cards/calc_card';
import CalcCard2 from './cards/calc_card2';
import  SimpleTabs from './cards/UI/ui_pagethree/tab';
import CustomizedTables from './cards/UI/ui_pagefour/table_datasource';



import AppAnimate from '../../../@crema/core/AppAnimate';
import Card from '@material-ui/core/Card';
import { Grid } from '@material-ui/core';
const useStyles = makeStyles({
  root1: {
    width: '100%',
    height:1700,
    backgroundColor:'rgb(246,248,249)'
   
   
  },
  flexcontainer:{

    display: "flex"
  },
  flexchild:{
    flex:0.6,
    border:"none"

  },
  grid:{
    paddingLeft:'40px',
    paddingRight:'40px',
    paddingTop:'40px'
    
  },
  tab:{
    marginTop:100
  }

});
const PageFour= () => {
  const classes = useStyles();
  return (
   
    <AppAnimate animation='transition.slideUpIn' delay={200}>
      <Box>
        <Box component='h4'  fontSize={20}>
        
         <Card className={classes.root1} >
         <Grid container spacing={4} className={classes.grid} >
         
           
         
           
           <SimpleTabs className={classes.tab}/>
         </Grid>
       


        <CustomizedTables />

        
         </Card>
        
        </Box>
       
      </Box>
    </AppAnimate>
  );
};

export default PageFour;

