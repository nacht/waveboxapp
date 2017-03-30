const React = require('react')
const { Dialog, RaisedButton, List, ListItem, FontIcon, Avatar } = require('material-ui')
const shallowCompare = require('react-addons-shallow-compare')
const { mailboxStore } = require('stores/mailbox')
const { Mailbox: { MailboxAvatar } } = require('Components')
const { userActions } = require('stores/user')
const Colors = require('material-ui/styles/colors')
const { remote: {shell} } = window.nativeRequire('electron')
const { PRIVACY_URL, TERMS_URL } = require('shared/constants')

const styles = {
  // Layout
  container: {
    display: 'flex',
    alignItems: 'stretch'
  },
  infoContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingRight: 16
  },
  accountContainer: {
    display: 'flex',
    width: '50%',
    paddingLeft: 16
  }
}

module.exports = React.createClass({
  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'AccountAuthScene',
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  propTypes: {
    params: React.PropTypes.object.isRequired
  },

  /* **************************************************************************/
  // Component Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    mailboxStore.listen(this.mailboxChanged)
  },

  componentWillUnmount () {
    mailboxStore.unlisten(this.mailboxChanged)
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState () {
    return {
      open: true,
      mailboxes: mailboxStore.getState().getMailboxesSupportingWaveboxAuth()
    }
  },

  mailboxChanged (mailboxState) {
    this.setState({
      mailboxes: mailboxState.getMailboxesSupportingWaveboxAuth()
    })
  },

  /* **************************************************************************/
  // User Interaction
  /* **************************************************************************/

  /**
  * Closes the modal
  */
  handleClose () {
    this.setState({ open: false })
    setTimeout(() => {
      window.location.hash = '/'
    }, 500)
  },

  /**
  * Shows privacy policy
  */
  handleShowPrivacyPolicy (evt) {
    evt.preventDefault()
    shell.openExternal(PRIVACY_URL)
  },

  /**
  * Shows terms of use
  */
  handleShowTermsOfUse (evt) {
    evt.preventDefault()
    shell.openExternal(TERMS_URL)
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * Renders the message for the given mode with a default catch all
  * @param mode: the mode to render the message for
  * @return jsx
  */
  renderMessage (mode) {
    if (mode === 'payment') {
      return (
        <div>
          <h3>
            To use Wavebox Pro you'll need to select which account you want to use for billing
          </h3>
          <p>
            If you don't want to use one of the accounts you've already added to wavebox,
            you can use with another one
          </p>
        </div>
      )
    } else if (mode === 'affiliate') {
      return (
        <div>
          <h3>
            To get your affiliate links you'll need to select which account you want to
            use as your affiliate & payment account with Wavebox
          </h3>
          <p>
            If you don't want to use one of the accounts you've already added to wavebox,
            you can use with another one
          </p>
        </div>
      )
    } else {
      return (
        <div>
          <h3>
            You need to pick the account you want to use for billing
          </h3>
          <p>
            If you don't want to use one of the accounts you've already added to wavebox,
            you can use with another one
          </p>
        </div>
      )
    }
  },

  render () {
    const { open, mailboxes } = this.state
    const { params } = this.props
    const { mode } = params

    return (
      <Dialog
        modal={false}
        open={open}
        bodyClassName='ReactComponent-MaterialUI-Dialog-Body-Scrollbars'
        autoScrollBodyContent
        onRequestClose={this.handleClose}>
        <div style={styles.container}>
          <div style={styles.infoContainer}>
            {this.renderMessage(mode)}
            <p style={{color: Colors.grey700, fontSize: '85%'}}>
              <span>By continuing you agree to our </span>
              <a style={{color: Colors.blue700}} onClick={this.handleShowTermsOfUse} href='#'>
                terms of use
              </a>
              <span> and </span>
              <a style={{color: Colors.blue700}} onClick={this.handleShowPrivacyPolicy} href='#'>
                privacy policy
              </a>
            </p>
            <br />
            <RaisedButton
              label='Cancel'
              onClick={this.handleClose} />
          </div>
          <div style={styles.accountContainer}>
            <List>
              {mailboxes.map((mailbox) => {
                return (
                  <ListItem
                    key={mailbox.id}
                    leftAvatar={<MailboxAvatar mailbox={mailbox} />}
                    primaryText={mailbox.displayName}
                    secondaryText={mailbox.humanizedType}
                    onClick={(evt) => userActions.authenticateWithMailbox(mailbox, { mode: mode })} />)
              })}
              <ListItem
                leftAvatar={(
                  <Avatar backgroundColor='rgb(223, 75, 56)' icon={(<FontIcon className='fa fa-fw fa-google' />)} />
                )}
                primaryText='Sign in with Google'
                secondaryText='Use a different Google Account'
                onClick={(evt) => userActions.authenticateWithGoogle({ mode: mode })} />
              <ListItem
                leftAvatar={(
                  <Avatar backgroundColor='rgb(0, 114, 198)' icon={(<FontIcon className='fa fa-fw fa-windows' />)} />
                )}
                primaryText='Sign in with Microsoft'
                secondaryText='Use a different Outlook or Office Account'
                onClick={(evt) => userActions.authenticateWithMicrosoft({ mode: mode })} />
            </List>
          </div>
        </div>
      </Dialog>
    )
  }
})