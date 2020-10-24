import React from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import FilterListIcon from '@material-ui/icons/FilterList';
import SimpleSelect from '../Pages/cards/UI/dropDown/dropDown';
import TimeDrop from '../Pages/cards/UI/dropDown/dropdown_time';
//import SearchBar from '../../../@crema/core/SearchBar';
//import Badge from '../../../@crema/core/Badge/index';
import OutlinedCard1 from './cards/card1';
import OutlinedCard2 from './cards/card2';
import OutlinedCard3 from './cards/card3';
import OutlinedCard4 from './cards/card4';
import OutlinedCard5 from './cards/card5';
import OutlinedCard6 from './cards/card6';

import AppAnimate from '../../../@crema/core/AppAnimate';
import Card from '@material-ui/core/Card';
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

  }

});
const PageOne = () => {
  const classes = useStyles();
  return (
   
    <AppAnimate animation='transition.slideUpIn' delay={200}>
      <Box>
        <Box component='h4' mb={3} fontSize={20}>
         <Card className={classes.root1} >


         <div className={classes.flexcontainer}>
         <div className={classes.flexchild}>

         <FilterListIcon style={{ display: 'inline-block', float:'left'}}/>
         <SimpleSelect style={{ display: 'inline-block'}}/>
         </div>
         <div className={classes.flexchild}>


         <FilterListIcon style={{ display: 'inline-block', float:'left'}}/>
         <TimeDrop style={{ display: 'inline-block', verticalAlign:"top"}}/>
         </div>
         
          </div><hr/>
         <OutlinedCard1/>
        <OutlinedCard2/>
        <OutlinedCard3/>
        <OutlinedCard4/>
        <OutlinedCard5/>
        <OutlinedCard6/>


        
        
         </Card>
         <hr/>
        </Box>
       
      </Box>
    </AppAnimate>
  );
};

export default PageOne;

