import React from 'react';
import Box from '@material-ui/core/Box';
import AppAnimate from '../../../@crema/core/AppAnimate';
import Card from '@material-ui/core/Card';
import {fade, makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import RadioGroup from '@material-ui/core/RadioGroup';
import {withStyles} from '@material-ui/core/styles';
import DescriptionIcon from '@material-ui/icons/Description';
import PictureAsPdfSharpIcon from '@material-ui/icons/PictureAsPdfSharp';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {Typography} from '@material-ui/core';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import 'date-fns';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';

const StyledMenuItem = withStyles((theme) => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
    width: 150,
  },
}))(MenuItem);
const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));
const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    height: 750,
    backgroundColor: '#f0f0f5',
  },
  inside: {
    marginTop: 50,
    marginLeft: 30,
    //  marginRight: 30,
    height: 650,
    width: '90%',
    position: 'fixed',
    display: 'inline-block',
  },
  btnRoot: {
    marginTop: '5px',
    marginLeft: '10px',
    width: 150,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const Audit = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  // const classes = useStyles();
  const [model, setModel] = React.useState('');

  const handleChange = (event) => {
    setModel(event.target.value);
  };
  const [selectedDate, setSelectedDate] = React.useState(
    new Date('2014-08-18T21:11:54'),
  );

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <AppAnimate animation='transition.slideUpIn' delay={200}>
      <Box>
        <Box component='p' fontSize={16}>
          {/* Audit Page */}
          <Card className={classes.card}>
            <Box component='p'>
              <Card className={classes.inside} variant='outlined'>
                {/* Adding buttons on the top */}
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                  // onClick={onGoToDashboard}
                  // disabled={isSubmitting}
                  className={classes.btnRoot}>
                  Refresh
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                  className={classes.btnRoot}>
                  Clear
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  type='submit'
                  className={classes.btnRoot}>
                  {' '}
                  Print{' '}
                </Button>
                <Button
                  aria-controls='customized-menu'
                  aria-haspopup='true'
                  variant='contained'
                  color='primary'
                  className={classes.btnRoot}
                  onClick={handleClick}>
                  Export{' '}
                </Button>
                <StyledMenu
                  id='customized-menu'
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}>
                  <StyledMenuItem>
                    <ListItemIcon>
                      <PictureAsPdfSharpIcon />
                    </ListItemIcon>
                    <ListItemText primary='PDF' />
                  </StyledMenuItem>
                  <StyledMenuItem>
                    <ListItemIcon>
                      <DescriptionIcon />
                    </ListItemIcon>
                    <ListItemText primary='CSV' />
                  </StyledMenuItem>
                </StyledMenu>
                <div>
                  {/* Adding text fields */}
                  <FormControl
                    variant='outlined'
                    required
                    className={classes.formControl}>
                    <Typography>Model :</Typography>
                    <Select
                      style={{width: 400}}
                      labelId='demo-simple-select-outlined-label'
                      id='demo-simple-select-outlined'
                      value={model}
                      onChange={handleChange}
                      label='Environments'>
                      <MenuItem value={'Consol'}>Consol</MenuItem>
                      <MenuItem value={'mgmt_rpt'}>MGMT_RPT</MenuItem>
                      <MenuItem value={'ownership'}>Ownership</MenuItem>
                      <MenuItem value={'rate'}>Rate</MenuItem>
                    </Select>
                    <FormControlLabel
                      value='Anytime'
                      control={<Radio color='primary' />}
                      label='Anytime'
                    />
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                      <Grid container justify='space-around'>
                        <KeyboardDatePicker
                          disableToolbar
                          variant='inline'
                          format='MM/dd/yyyy'
                          margin='normal'
                          id='date-picker-inline'
                          label='Date picker inline'
                          value={selectedDate}
                          onChange={handleDateChange}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                        />
                        <KeyboardDatePicker
                          margin='normal'
                          id='date-picker-dialog'
                          label='Date picker dialog'
                          format='MM/dd/yyyy'
                          value={selectedDate}
                          onChange={handleDateChange}
                          KeyboardButtonProps={{
                            'aria-label': 'change date',
                          }}
                        />
                      </Grid>
                    </MuiPickersUtilsProvider>
                  </FormControl>
                  <form>
                    <label for='CalcGroup'>Calc Group</label>
                    <br></br>
                    <input type='text' id='CalcGroup' name='CalcGroup' />
                  </form>
                  <form>
                    <label for='Calc'>Calculation</label>
                    <br></br>
                    <input type='text' id='Calc' name='Calc' />
                  </form>
                  <form>
                    <label for='User'>User</label>
                    <br></br>
                    <input type='text' id='user' name='user' />
                  </form>
                  <FormControl
                    variant='outlined'
                    required
                    className={classes.formControl}>
                    <Typography>Action</Typography>
                    <Select
                      style={{width: 400}}
                      labelId='demo-simple-select-outlined-label'
                      id='demo-simple-select-outlined'
                      value={model}
                      onChange={handleChange}
                      label='Action'>
                      <MenuItem value={'Add'}>Add</MenuItem>
                      <MenuItem value={'Delete'}>Delete</MenuItem>
                      <MenuItem value={'Update'}>Update</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <hr />
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    placeholder='Search…'
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{'aria-label': 'search'}}
                  />
                </div>
              </Card>
            </Box>
          </Card>
        </Box>
      </Box>
    </AppAnimate>
  );
};

export default Audit;
