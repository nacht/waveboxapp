import PropTypes from 'prop-types'
import React from 'react'
import { Button } from '@material-ui/core'
import shallowCompare from 'react-addons-shallow-compare'
import { withStyles } from '@material-ui/core/styles'
import { accountStore } from 'stores/account'
import classNames from 'classnames'
import lightBlue from '@material-ui/core/colors/lightBlue'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import fasGem from '@fortawesome/fontawesome-pro-solid/faGem'

const styles = {
  root: {
    position: 'absolute',
    top: 10000,
    bottom: -10000,
    left: 0,
    right: 0,
    height: '100%',
    width: '100%',
    display: 'flex',
    backgroundColor: '#f7f7f7',
    color: 'rgb(167, 171, 169)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    cursor: 'default',
    fontWeight: 300,

    '&.active': {
      top: 0,
      bottom: 0
    }
  },
  proIcon: {
    color: lightBlue[600],
    fontSize: '75px'
  },
  title: {
    fontWeight: 300
  },
  text: {
    marginBottom: 5,
    marginTop: 0
  },
  button: {
    marginTop: 15
  },
  buttonIcon: {
    marginRight: 6
  }
}

@withStyles(styles)
class MailboxTabRestricted extends React.Component {
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  static propTypes = {
    mailboxId: PropTypes.string.isRequired,
    serviceId: PropTypes.string.isRequired
  }

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    accountStore.listen(this.accountChanged)
  }

  componentWillUnmount () {
    accountStore.unlisten(this.accountChanged)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.serviceId !== nextProps.serviceId) {
      const accountState = accountStore.getState()
      this.setState({
        isActive: accountState.activeServiceId() === nextProps.serviceId,
        displayName: accountState.resolvedServiceDisplayName(nextProps.serviceId)
      })
    }
  }

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  state = (() => {
    const accountState = accountStore.getState()
    return {
      isActive: accountState.activeServiceId() === this.props.serviceId,
      displayName: accountState.resolvedServiceDisplayName(this.props.serviceId)
    }
  })()

  accountChanged = (accountState) => {
    this.setState({
      isActive: accountState.activeServiceId() === this.props.serviceId,
      displayName: accountState.resolvedServiceDisplayName(this.props.serviceId)
    })
  }

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render () {
    const {
      classes,
      mailboxId,
      serviceId,
      className,
      ...passProps
    } = this.props
    const {
      isActive,
      displayName
    } = this.state

    return (
      <div className={classNames(classes.root, isActive ? 'active' : undefined, className)} {...passProps}>
        <FontAwesomeIcon icon={fasGem} className={classes.proIcon} />
        <h1 className={classes.title}>Purchase Wavebox</h1>
        <p className={classes.text}>
          {`Use your ${displayName} Service and others by purchasing Wavebox`}
        </p>
        <Button
          variant='raised'
          color='primary'
          className={classes.button}
          onClick={() => { window.location.hash = '/pro' }}>
          <FontAwesomeIcon icon={fasGem} className={classes.buttonIcon} />
          Find out more
        </Button>
      </div>
    )
  }
}

export default MailboxTabRestricted