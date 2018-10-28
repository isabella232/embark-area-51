import {AppSwitch} from '@coreui/react';
import {Label} from 'reactstrap';
import React from 'react';
import PropTypes from 'prop-types';
import {Treebeard, decorators} from 'react-treebeard';
import classNames from 'classnames';
import {DARK_THEME} from '../constants';
import FontAwesome from 'react-fontawesome';

import './FileExplorer.css';

const isDarkTheme= (theme) => theme === DARK_THEME;

const style = (theme) => ({
  tree: {
    base: {
      listStyle: 'none',
      backgroundColor: isDarkTheme(theme) ? '#1C1C1C' : '#FFFFFF',
      color: isDarkTheme(theme) ? '#FFFFFF' : '#000000',
      padding: '10px 0 0 10px',
      margin: 0,
      overflow: 'auto',
      position: 'absolute',
      top: 0,
      bottom: '40px',
      left: 0,
      right: 0
    },
    node: {
      base: {
        position: 'relative',
        verticalAlign: 'middle'
      },
      link: {
        cursor: 'pointer',
        position: 'relative',
        padding: '0px 5px',
        display: 'block'
      },
      toggle: {
        base: {
          display: 'inline-block',
          marginRight: '10px'
        },
        wrapper: {
          margin: '-7px 0 0 0'
        },
        height: 7,
        width: 7,
        arrow: {
          fill: isDarkTheme(theme) ? '#FFFFFF' : '#000000',
          strokeWidth: 0
        }
      },
      header: {
        base: {
          display: 'inline-block'
        },
        connector: {
          width: '2px',
          height: '12px',
          borderLeft: 'solid 2px black',
          borderBottom: 'solid 2px black',
          position: 'absolute',
          top: '0px',
          left: '-21px'
        },
        title: {
          lineHeight: '24px'
        }
      },
      subtree: {
        listStyle: 'none',
        paddingLeft: '22px'
      },
      loading: {
        color: '#E2C089'
      }
    }
  }
});

const Container = (props) => (
  <div className="w-100" onClick={props.onClick}>
    <props.decorators.Toggle style={props.style.toggle}/>
    <props.decorators.Header  node={props.node} style={props.style.header}/>
  </div>
)

class Header extends React.Component {
  constructor(props) {
    super(props)
    this.state = {active: null};
  }

  resolveIcon() {
    let icon;

    if (!this.props.node.children) {
      const extension = this.props.node.path.split('.').pop();
      switch(extension) {
        case 'html':
          icon = 'text-danger fa fa-html5';
          break;
        case 'css':
          icon = 'text-warning fa fa-css3';
          break;
        case 'js':
        case 'jsx':
          icon = 'text-primary icon js-icon';
          break;
        case 'json':
          icon = 'text-success icon hjson-icon';
          break;
        case 'sol':
          icon = 'text-warning icon solidity-icon';
          break;
        default:
          icon = 'fa fa-file-o';
      }
    } else {
      switch(this.props.node.name) {
        case 'dist':
          icon = 'text-danger icon easybuild-icon';
          break;
        case 'config':
          icon = 'text-warning fa fa-cogs';
          break;
        case 'contracts':
          icon = 'text-success icon appstore-icon';
          break;
        case 'app':
          icon = 'text-primary fa fa-code';
          break;
        case 'test':
          icon = 'icon test-dir-icon';
          break;
        case 'node_modules':
          icon = 'fa fa-folder-o';
          break;
        default:
          icon = 'fa fa-folder';
      }
    }
    return icon;
  }

  activateNode() {
    this.setState({active : true});
  }

  deactivateNode() {
    this.setState({active : true});
  }

  renderAction() {
    return (
      <div className="file-explorer__action">
        {this.props.node.children &&
          <React.Fragment>
            <FontAwesome name="plus" className="text-success mr-2" />
            <FontAwesome name="folder-open" className="text-success mr-2" />
          </React.Fragment>
        }
        <FontAwesome name="trash" className="text-danger" />
      </div>
    )
  }

  render() {
    return (
      <div className="mb-1 d-inline-block" style={style.base} 
           onMouseEnter={() => this.activateNode()} 
           onMouseLeave={() => this.deactivateNode()}>
        <i className={classNames('mr-1', this.resolveIcon())} />
        <span className="">{this.props.node.name}</span>
        {this.state.active && this.renderAction()}
      </div>
    );
  }
};

Header.propTypes = {
  style: PropTypes.object,
  node: PropTypes.object
};

decorators.Header = Header;
decorators.Container = Container;

class FileExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {cursor: null};
  }

  onToggle(node, toggled) {
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    } else {
      this.props.fetchFile(node);
    }
    this.setState({cursor: node});
  }

  nodeEquals(a, b) {
    return a && b && a.path && b.path && a.name && b.name &&
      a.path === b.path &&
      a.name === b.name;
  }

  isNodeInPath(a, b) {
    return a && b && a.path && b.path &&
      a.path !== b.path &&
      b.path.indexOf(a.path) > -1;
  }

  data(nodes) {
    let filtered = [];
    if (!Array.isArray(nodes)) return filtered;

    const cursor = this.state.cursor;
    const showHidden = this.props.showHiddenFiles;
    // we need a foreach to build an array instead of a
    // filter to prevent mutating the original object (in props)
    nodes.forEach(node => {
      if (!showHidden && node.isHidden) return;
      let updatedNode = {...node};

      // if it's a folder, filter the children
      if (node.children) {
        const children = this.data(node.children);
        if (children.length) {
          updatedNode.children = children;
        }
      }

      // if this is the selected node, set it as active
      if (this.nodeEquals(node, cursor)) {
        updatedNode.active = cursor.active;
        // if this node is the selected node and is a folder, set
        // it as toggled (expanded) according to the selected node
        if (node.children) updatedNode.toggled = cursor.toggled;
      }
      // if this node is a folder, and it's a parent of the selected
      // folder, force toggle it
      if (node.children && this.isNodeInPath(node, cursor)) {
        updatedNode.toggled = true;
      }
      filtered.push(updatedNode);
    });

    return filtered;
  }

  render() {
    return (
      <div className="d-flex flex-column">
        <Treebeard
          data={this.data(this.props.files)}
          decorators={decorators}
          onToggle={this.onToggle.bind(this)}
          style={style(this.props.theme)}
        />

        <Label className="hidden-toogle mb-0 pt-2 pr-2 pb-1 border-top text-right">
          <span className="mr-2 align-top">Show hidden files</span>
          <AppSwitch color="success" variant="pill" size="sm" onChange={this.props.toggleShowHiddenFiles}/>
        </Label>
       </div>
    );
  }
}

FileExplorer.propTypes = {
  files: PropTypes.array,
  fetchFile: PropTypes.func,
  showHiddenFiles: PropTypes.bool,
  toggleShowHiddenFiles: PropTypes.func,
  theme: PropTypes.string
};

export default FileExplorer;
