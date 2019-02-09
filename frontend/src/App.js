import React, { Component } from 'react';
import axios from 'axios'
import logo from './logo.svg';
import './App.css';

const ListFragment = ({listGlobal, id, child, tasks, ...rest}) => {
  const {selectedId, highlightedId} = listGlobal

  const title = rest.title || tasks.byId[id].title
  const children = List.getByParent(tasks, id)

  const shouldShowMenu = selectedId === id
  const shouldHighlight = highlightedId === id

  const wrapProps = {
    onClick: e => {
      listGlobal.setMenu(id, true)
      listGlobal.setHighlighted(id, true)
      e.stopPropagation()
    },
    onMouseOver: e => {
      listGlobal.setHighlighted(id, true)
      e.stopPropagation()
    },
    className: shouldHighlight && "highlight-item"
  }

  const frag = (<React.Fragment>
    <span className={child || "title-item"}>{title}</span>
    {shouldShowMenu && child && <span>
    </span>}
    {children && (<ul>
      {children.map(v => <ListFragment listGlobal={listGlobal} key={v.id} {...v} child tasks={tasks} />)}
      {shouldShowMenu && <li>
        <form onSubmit={e => {e.preventDefault(); listGlobal.addChild(id, listGlobal.inputValue);}}>
          <input
            autoFocus
            onBlur={e => {listGlobal.setMenu(id, false); listGlobal.setHighlighted(id, false)}}
            onChange={e => {listGlobal.setInput(e.target.value)}}
            value={listGlobal.inputValue}
          />
          <button type="submit">+</button>
        </form>
      </li>}
    </ul>)}
  </React.Fragment>)

  if (child)
    return (<li {...wrapProps}>{frag}</li>)
  else
    return (<div {...wrapProps}>{frag}</div>)
}

class List extends Component {
  constructor(props) {
    super()
    const tasks = List.generateIndexes([])
    const inputValue = ""
    this.state = {tasks, inputValue}
    axios.get('//localhost:3001/tasks')
      .then(res => {
        if (res.status !== 200)
          throw res
        const tasks = List.generateIndexes(res.data)
        this.setState({tasks})
      })
  }

  static getByParent(indexes, id) {
    return (indexes.byParent[id] || []).map(id => indexes.byId[id])
  }

  static generateIndexes(data = []) {
    const byId = {}
    const byParent = {}
    for (const row of data) {
      byId[row.id] = row
      if (!byParent[row.parent])
        byParent[row.parent] = []
      byParent[row.parent].push(row.id)
    }
    return {byId, byParent}
  }

  render() {
    const {
      selectedId,
      highlightedId,
      inputValue
    } = this.state

    const setMenu = (id, toSet) => {
      if (toSet)
        this.setState({selectedId: id})
      else if (this.state.selectedId === id)
        this.setState({selectedId: null})
    }

    const setHighlighted = (id, toSet) => {
      if (!this.state.selectedId || this.state.selectedId === id)
        this.setState({highlightedId: id})
      if (!toSet && this.state.highlightedId === id)
        this.setState({highlightedId: null})
    }

    const setInput = (input) => {
      this.setState({inputValue: input})
    }

    const addChild = async (id, input) => {
      const res = await axios.post("//localhost:3001/tasks", {title: input, parent: id}, {headers: {'Prefer': 'return=representation'}})
      const {data: newItems} = res
      const newItem = newItems[0]
      const byId = {...this.state.tasks.byId, [newItem.id]: newItem}
      const byParentPreArray = this.state.tasks.byParent[id] || []
      const byParentPostArray = [...byParentPreArray, newItem.id]
      const byParent = {...this.state.tasks.byParent, [id]: byParentPostArray}
      const tasks = {byId, byParent}
      const inputValue = ""
      this.setState({tasks, inputValue})
    }

    const listGlobal = {
      // state
      selectedId,
      highlightedId,
      inputValue,
      // actions
      setMenu,
      setHighlighted,
      setInput,

      addChild,
    }
    return (<ListFragment listGlobal={listGlobal} title="My New List" id="null" tasks={this.state.tasks}/>)
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <List />
      </div>
    );
  }
}

export default App;
