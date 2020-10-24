import React from 'react';
import {Icon, ListItem, ListItemText} from '@material-ui/core';
import {withRouter} from 'react-router-dom';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {Badge, NavLink} from '../../../index';
import Box from '@material-ui/core/Box';
import IntlMessages from '../../../utility/IntlMessages';
import useStyles from './VerticalItem.style';

const VerticalItem = (props) => {
  const classes = useStyles(props);
  const {item} = props;
  return (
    <ListItem
      button
      component={NavLink}
      to={item.url}
      activeClassName='active'
      className={clsx(classes.navItem, 'nav-item')}
      exact={item.exact}>
      {item.icon && (
        <Box component='span' mr={6}>
          <Icon
            className={clsx(classes.listIcon, 'nav-item-icon')}
            color='action'>
            {item.icon}
          </Icon>
        </Box>
      )}
      <ListItemText
        primary={<IntlMessages id={item.messageId} />}
        classes={{primary: 'nav-item-text'}}
      />
      {item.count && (
        <Box mr={1} clone>
          <Badge count={item.count} color={item.color} />
        </Box>
      )}
    </ListItem>
  );
};

VerticalItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    icon: PropTypes.string,
    url: PropTypes.string,
  }),
};

VerticalItem.defaultProps = {};

export default withRouter(React.memo(VerticalItem));
