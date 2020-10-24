import React from 'react';
import QueueAnim from 'rc-queue-anim';
import PropTypes from 'prop-types';

const ListAnim = ({children}) => {
  return (
    <QueueAnim
      type={['right']}
      interval={[100]}
      delay={[50]}
      duration={[200]}
      ease={['easeOutBack']}>
      {children}
    </QueueAnim>
  );
};

export default ListAnim;

ListAnim.propTypes = {
  children: PropTypes.node.isRequired,
};
