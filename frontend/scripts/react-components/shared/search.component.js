import { h, Component } from 'preact';
import 'styles/components/shared/search.scss';
import 'styles/components/shared/autocomplete.scss';
import Downshift from 'downshift/preact';
import deburr from 'lodash/deburr';


import NodeTitleGroup from 'containers/shared/node-title-group-react.container';
import SearchResult from './search-result.component';

export default class Search extends Component {

  static getNodeIds(selectedItem) {
    const parts = (selectedItem.id + '').split('_');
    if (parts.length > 1) {
      return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
    }
    return [selectedItem.id];
  }

  static isValidChar(key) {
    const deburredKey = deburr(key);
    return (/^([a-z]|[A-Z]){1}$/.test(deburredKey));
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpened: false,
      specialCharPressed: false
    };
    this.onOpenClicked = this.onOpenClicked.bind(this);
    this.onCloseClicked = this.onCloseClicked.bind(this);
    this.onSelected = this.onSelected.bind(this);
    this.onAddNode = this.onAddNode.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onKeyup = this.onKeyup.bind(this);
    this.getDownshiftRef = this.getDownshiftRef.bind(this);
    this.getInputRef = this.getInputRef.bind(this);
    this.navigateToActor = this.navigateToActor.bind(this);
    this.isNodeSelected = this.isNodeSelected.bind(this);

    document.addEventListener('keydown', this.onKeydown);
    document.addEventListener('keyup', this.onKeyup);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydown);
    document.removeEventListener('keyup', this.onKeyup);
  }

  getDownshiftRef(instance) {
    this.downshift = instance;
  }

  getInputRef(el) {
    this.input = el;
  }

  onOpenClicked(e) {
    if (e) e.stopPropagation();
    this.setState({
      isOpened: true
    }, () => ((this.input && !this.input.focused) && this.input.focus()));
  }

  onCloseClicked(e) {
    if (e) e.stopPropagation();
    this.setState({
      isOpened: false
    });
  }

  onSelected(selectedItem) {
    if (this.isNodeSelected(selectedItem)) return this.downshift.clearSelection();
    const ids = Search.getNodeIds(selectedItem);
    if (selectedItem.selected) {
      this.props.onRemoveNode(ids);
    } else {
      this.props.onAddNode(ids);
    }
    this.onCloseClicked();
  }

  onAddNode(e, selectedItem) {
    if (e) e.stopPropagation();
    const ids = Search.getNodeIds(selectedItem);
    this.props.onAddNode(ids);
    this.downshift.reset();
    this.input.focus();
  }

  onKeydown(e) {
    const { specialCharPressed, isOpened } = this.state;
    if (!isOpened && Search.isValidChar(e.key) && !specialCharPressed) {
      this.onOpenClicked();
    } else if (e.key === 'Escape' && isOpened) {
      this.onCloseClicked();
    } else {
      this.setState(state => ({ specialCharPressed: state.specialCharPressed + 1 }));
    }
  }

  onKeyup(e) {
    if (!Search.isValidChar(e.key)) {
      this.setState(state => ({ specialCharPressed: state.specialCharPressed - 1 }));
    }
  }

  isNodeSelected(node) {
    return [node, node.exporter, node.importer]
      .filter(n => !!n)
      .map(n => n.id)
      .reduce((acc, next) => {
        return acc || this.props.selectedNodesIds.includes(next);
      }, false);
  }

  navigateToActor(e, item, type) {
    if (e) e.stopPropagation();
    const node = item[type.toLowerCase()] || item;
    this.props.navigateToActor(node.profileType, node.id);
  }

  render({ nodes = [], selectedNodesIds = [] }) {
    if (this.state.isOpened === false) {
      return <div onClick={this.onOpenClicked} class='nav-item'>
        <svg class='icon icon-search'><use xlinkHref='#icon-search' /></svg>
      </div>;
    }

    return (<div class='c-search'>
      <svg class='icon icon-search'><use xlinkHref='#icon-search' /></svg>
      <div class='c-search__veil' onClick={this.onCloseClicked} />
      <div class='autocomplete'>
        <Downshift
          itemToString={i => (i === null ? '' : i.name)}
          onSelect={this.onSelected}
          ref={this.getDownshiftRef}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex
          }) => {
            // stopPropagation is called to avoid calling onOpenClicked.
            return <div class='autocomplete-container' onClick={e => e.stopPropagation()}>
              <div class='autocomplete-bar'>
                <div
                  style={selectedNodesIds.length > 3 && { overflow: 'auto' }}
                >
                  <NodeTitleGroup />
                </div>
                <input
                  {...getInputProps({ placeholder: 'Search a producer, trader or country of import' })}
                  ref={this.getInputRef}
                />
              </div>
              {isOpen &&
                <div class='suggestions'>
                  {
                    nodes.filter(
                      i => !inputValue
                        || i.name.toLowerCase().includes(inputValue.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((item, row) => (
                        <SearchResult
                          key={item.id}
                          value={inputValue}
                          isHighlighted={row === highlightedIndex}
                          item={item}
                          itemProps={getItemProps({ item })}
                          selected={this.isNodeSelected(item)}
                          onClickNavigate={this.navigateToActor}
                          onClickAdd={this.onAddNode}
                        />
                      ))
                  }
                </div>
              }
            </div>;
          }}
        </Downshift>
      </div>
    </div>);
  }
}