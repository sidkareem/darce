import {makeStyles} from '@material-ui/core/styles';
import {useContext} from 'react';
import AppContext from '../../../utility/AppContext';

const useStyles = makeStyles((theme) => {
  const {themeMode} = useContext(AppContext);
  return {
    navItem: {
      height: 44,
      marginTop: 2,
      marginBottom: 2,
      paddingLeft:
        theme.direction === 'ltr' ? (props) => 17 + 50 * props.level : 12,
      paddingRight:
        theme.direction === 'rtl' ? (props) => 17 + 50 * props.level : 12,
      color:
        themeMode === 'light'
          ? theme.palette.text.hint
          : 'rgba(255,255,255,0.38)',
      fontWeight: 700,
      fontSize: 14,
      cursor: 'pointer',
      textDecoration: 'none!important',

      [theme.breakpoints.up('xl')]: {
        fontSize: 16,
        marginTop: 4,
        marginBottom: 4,
        paddingLeft:
          theme.direction === 'ltr' ? (props) => 24 + 50 * props.level : 12,
        paddingRight:
          theme.direction === 'rtl' ? (props) => 24 + 50 * props.level : 12,
      },
      '&.nav-item-header': {
        textTransform: 'uppercase',
      },
    },
  };
});

export default useStyles;
