import React, { Component } from 'react';
import axios from 'axios'
import logo from './logo.svg';
import './App.css';

const ListFragment = ({id, title, children, setMenu, shouldShowInput, child, ...rest}) => {
  const frag = (<React.Fragment>
    <span className={child || "title-item"}>{title}</span>
    {children && (<ul>
      {children.map(v => <ListFragment key={v.id} {...v} child />)}
      {shouldShowInput && <li><button>+</button></li>}
    </ul>)}
  </React.Fragment>)
  return (child && <li>{frag}</li>) || frag
}

class List extends Component {
  constructor(props) {
    super()
    let data = [
      {title: "Loading"},
    ]
    this.state = {data}
    axios.get('//localhost:3001/tasks')
      .then(res => {
        if (res.status !== 200)
          throw res
        const indexes = List.generateIndexes(res.data)
        const nestified = indexes.byParent.null.map(task => List.nestify(indexes, task))
        this.setState({data: nestified})
      })
  }

  static generateIndexes(data) {
    const byId = {}
    const byParent = {}
    for (const row of data) {
      byId[row.id] = row
      if (!byParent[row.parent])
        byParent[row.parent] = []
      byParent[row.parent].push(row)
    }
    return {byId, byParent}
  }

  static nestify(indexes, task) {
    const parentTask = indexes.byId[task.parent]
    const children = (indexes.byParent[task.id] || []).map(v => this.nestify(indexes, v))
    return {parentTask, children, ...task}
  }

  render() {
    return (<ListFragment title="My New List" children={this.state.data} />)
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
