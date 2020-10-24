import makeStyles from '@material-ui/core/styles/makeStyles';
import {Fonts} from '../../constants/AppEnums';

const useStyles = makeStyles((theme) => ({
  '@global': {
    // for global styles
    '.MuiLink-root': {
      fontFamily: Fonts.REGULAR,
    },
    '.pointer': {
      cursor: 'pointer',
    },
    '.MuiTableCell-stickyHeader': {
      backgroundColor: theme.palette.background.paper,
    },
  },
}));

export default useStyles;
