import {makeStyles} from '@material-ui/core/styles';
import {useContext} from 'react';
import AppContext from '../../../utility/AppContext';
import {Fonts, ThemeMode} from '../../../../shared/constants/AppEnums';

const useStyles = makeStyles((theme) => {
  const {themeMode} = useContext(AppContext);
  return {
    navItem: {
      height: 44,
      marginTop: 2,
      marginBottom: 2,
      width: 'calc(100% - 16px)',
      borderRadius: '0 30px 30px 0',
      paddingLeft:
        theme.direction === 'ltr' ? (props) => 17 + 50 * props.level : 17,
      paddingRight:
        theme.direction === 'rtl' ? (props) => 17 + 50 * props.level : 17,

      [theme.breakpoints.up('xl')]: {
        paddingLeft:
          theme.direction === 'ltr' ? (props) => 24 + 50 * props.level : 24,
        paddingRight:
          theme.direction === 'rtl' ? (props) => 24 + 50 * props.level : 24,
      },

      '& .nav-item-text': {
        fontFamily: Fonts.REGULAR,
        fontSize: 16,
        color: theme.palette.sidebar.textColor,

        [theme.breakpoints.up('xl')]: {
          marginTop: 4,
          marginBottom: 4,
          fontSize: 18,
        },
      },

      '& .nav-item-icon': {
        color: theme.palette.sidebar.textColor,
      },

      '& .nav-item-icon-arrow': {
        color: theme.palette.sidebar.textColor,
      },

      '& .MuiIconButton-root': {
        marginRight: -16,
      },

      '&.open, &:hover, &:focus': {
        '& .nav-item-text': {
          fontFamily: Fonts.MEDIUM,
          color: themeMode === ThemeMode.LIGHT ? '#313541' : '#fff',
        },

        '& .nav-item-icon': {
          color: themeMode === ThemeMode.LIGHT ? '#313541' : '#fff',
        },

        '& .nav-item-icon-arrow': {
          color: themeMode === ThemeMode.LIGHT ? '#313541' : '#fff',
        },
      },
    },
    listItemText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    listIcon: {
      fontSize: 18,
      [theme.breakpoints.up('xl')]: {
        fontSize: 20,
      },
    },
  };
});
export default useStyles;
