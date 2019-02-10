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
    onMouseOver: e => {
      listGlobal.setSelection(id, {toSetHighlighted: true})
      e.stopPropagation()
    },
    className: shouldHighlight && "highlight-item"
  }

  const showMenuHandler = e => {
    listGlobal.setSelection(id, {toSetMenu: !shouldShowMenu, toSetHighlighted: true})
    e.stopPropagation()
  }

  const frag = (<React.Fragment>
    <span className={child || "title-item"} onClick={showMenuHandler}>{title}</span>
    {shouldShowMenu && child && <span>
    </span>}
    {children && (<ul>
      {children.map(v => <ListFragment listGlobal={listGlobal} key={v.id} {...v} child tasks={tasks} />)}
      {shouldShowMenu && <li>
        <form onSubmit={e => {e.preventDefault(); listGlobal.addChild(id, listGlobal.inputValue);}}>
          <input
            autoFocus
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

    const setSelection = (id, {toSetMenu, toSetHighlighted}) => {
      let {selectedId, highlightedId} = this.state
      if (typeof toSetMenu === "boolean") {
        if (toSetMenu)
          selectedId = id
        else if (selectedId === id)
          selectedId = null
      }

      if (typeof toSetHighlighted === "boolean") {
        if (!selectedId || selectedId === id)
          highlightedId = id
        if (!toSetHighlighted && highlightedId === id)
          highlightedId = null
      }

      this.setState({selectedId, highlightedId})
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
      setSelection,

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
