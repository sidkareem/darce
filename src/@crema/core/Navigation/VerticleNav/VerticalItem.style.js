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
      fontWeight: 700,
      cursor: 'pointer',
      textDecoration: 'none !important',
      width: 'calc(100% - 16px)',
      borderRadius: '0 30px 30px 0',
      paddingLeft:
        theme.direction === 'ltr' ? (props) => 24 + 50 * props.level : 12,
      paddingRight:
        theme.direction === 'rtl' ? (props) => 24 + 50 * props.level : 12,
      '&.nav-item-header': {
        textTransform: 'uppercase',
      },
      '&.active': {
        backgroundColor: theme.palette.primary.main,
        pointerEvents: 'none',
        transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
        '& .nav-item-text': {
          color: theme.palette.common.white + '!important',
          fontFamily: Fonts.MEDIUM,
        },
        '& .nav-item-icon': {
          color: theme.palette.common.white + '!important',
        },
      },

      '&:hover, &:focus': {
        '& .nav-item-text': {
          color:
            themeMode === ThemeMode.LIGHT ? theme.palette.primary.main : '#fff',
        },

        '& .nav-item-icon': {
          color:
            themeMode === ThemeMode.LIGHT ? theme.palette.primary.main : '#fff',
        },

        '& .nav-item-icon-arrow': {
          color:
            themeMode === ThemeMode.LIGHT ? theme.palette.primary.main : '#fff',
        },
      },
      '& .nav-item-icon': {
        color: theme.palette.sidebar.textColor,
      },
      '& .nav-item-text': {
        color: theme.palette.sidebar.textColor,
        fontSize: 18,
      },
    },
    '@media (max-width: 100px)': {
      navItem: {
        paddingLeft:
          theme.direction === 'ltr' ? (props) => 17 + 50 * props.level : 12,
        paddingRight:
          theme.direction === 'rtl' ? (props) => 17 + 50 * props.level : 12,

        '& .nav-item-text': {
          fontSize: 16,
        },
      },
    },
    listIcon: {
      fontSize: 18,
      [theme.breakpoints.up('xl')]: {
        fontSize: 20,
      },
    },
    listItemText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: Fonts.REGULAR,
    },
  };
});
export default useStyles;
