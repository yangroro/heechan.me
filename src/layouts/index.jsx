import React from 'react';
import Helmet from 'react-helmet';
import '../assets/scss/init.scss';

class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div className="layout">
        <Helmet defaultTitle="양희찬 개발 블로그" />
        {children()}
      </div>
    );
  }
}

export default Layout;
