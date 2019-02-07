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
      listGlobal.setHighlighted(id)
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
      {shouldShowMenu && <li><input/></li>}
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
    this.state = {tasks}
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
      highlightedId
    } = this.state

    const setMenu = (id, toSet) => {
      if (toSet)
        this.setState({selectedId: id})
      else if (this.state.selectedId === id)
        this.setState({selectedId: null})
    }

    const setHighlighted = (id) => {
      this.setState({highlightedId: id})
    }

    const listGlobal = {
      // state
      selectedId,
      highlightedId,
      // actions
      setMenu,
      setHighlighted,
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
