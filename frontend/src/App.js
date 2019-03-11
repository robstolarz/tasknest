import React, { Component } from 'react';
import axios from 'axios'
import { configureStore, createAction, createReducer } from 'redux-starter-kit'
import { Provider, connect } from 'react-redux'
import logo from './logo.svg';
import './App.css';

function generateIndexes(data = []) {
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

const getTasksRecv = createAction('list/getTasksRecv')
const setShowingMenu = createAction('list/setShowingMenu')
const setHighlighted = createAction('list/setHighlighted')
const setInput = createAction('list/setInput')
const addChildRecv = createAction('list/addChildRecv')
const removeRecv = createAction('list/removeRecv')

const _ListContentPart = ({dispatch, id, content, highlightStatus, onClick}) => {
  if (!content)
    return "List title component goes here"
  return <span onClick={onClick}>
    {content.title}
    {highlightStatus === "menu" && <button type="button" onClick={() => {dispatch(remove({id}))}}>delete</button> }
  </span>
}
const ListContentPart = connect(
  (state, ownProps) => ({
    content: state.tasks.byId[ownProps.id],
    highlightStatus: (state.highlightedId === ownProps.id) && (state.isMenu ? "menu" : "highlight"),
  })
)(_ListContentPart)

const addChild = ({id, input}) => {
  return async dispatch => {
    const res = await axios.post("/api/tasks", {title: input, parent: id}, {headers: {'Prefer': 'return=representation'}})
    const {data: newItems} = res
    const newItem = newItems[0]
    dispatch(addChildRecv({parentId: id, newItem}))
  }
}
const remove = ({id}) => {
  return async dispatch => {
    const res = await axios.delete(`/api/tasks?id=eq.${id}`)
    dispatch(removeRecv({id}))
  }
}
const _ListLayoutPart = ({dispatch, id, childIDs, highlightStatus, inputValue, addChild, remove, setHighlighted, setShowingMenu, setInput}) => {
  // TODO: refactor this out to a component
  const ListChildrenPart = ({childIDs = []}) => (<ul>
    {childIDs.map(id => <ListLayoutPart key={id} id={id} />)}
    {/* TODO: also this component */ highlightStatus === "menu" && <li>
      <form onSubmit={e => {e.preventDefault(); addChild({id, input: inputValue});}}>
        <input
          autoFocus
          onChange={e => setInput({input: e.target.value})}
          value={inputValue}
        />
        <button type="submit">+</button>
      </form>
    </li>}
  </ul>)

  const wrapProps = {
    onMouseOver: e => {
      setHighlighted({id})
      e.stopPropagation()
    },
    className: highlightStatus && "highlight-item" || undefined
  }

  const showMenuHandler = e => {
    setShowingMenu({id, toSetMenu: !(highlightStatus === "menu")})
    e.stopPropagation()
  }

  return (
    <li {...wrapProps}>
      <ListContentPart id={id} onClick={showMenuHandler}/>
      <ListChildrenPart childIDs={childIDs} />
    </li>
  )
}
const ListLayoutPart = connect(
  (state, ownProps) => ({
    childIDs: state.tasks.byParent[ownProps.id],
    inputValue: state.inputValue,
    // TODO: highlightStatus selector
    highlightStatus: (state.highlightedId === ownProps.id) && (state.isMenu ? "menu" : "highlight"),
  }),
  {addChild, remove, setHighlighted, setShowingMenu, setInput}
)(_ListLayoutPart)


const _List = state => {
  if (!state.tasks.byParent.null)
    return "Tasks haven't loaded yet, but that's alright! :D"
  return (<ListLayoutPart id={null} />)
}
const List = connect(
  state => ({tasks: state.tasks})
)(_List)

const _reducers = {
  [getTasksRecv]: (state, {payload: {tasks}}) => {state.tasks = tasks},
  [setShowingMenu] : (state, {payload: {id, toSetMenu}}) => {
    state.isMenu = toSetMenu
    if (state.highlightedId !== id && toSetMenu)
      state.highlightedId = id
  },

  [setHighlighted] : (state, {payload: {id}}) => {
    if (!state.isMenu)
      state.highlightedId = id
  },

  [setInput] : (state, {payload: {input}}) => {
    state.inputValue = input
  },

  [addChildRecv]: (state, {payload: {parentId, newItem}}) => {
    state.tasks.byId[newItem.id] = newItem
    if (!state.tasks.byParent[parentId])
      state.tasks.byParent[parentId] = []

    state.tasks.byParent[parentId].push(newItem.id)
    state.inputValue = ""
  },


  [removeRecv]: (state, {payload: {id}}) => {
    const task = state.tasks.byId[id]

    const byParentArray = state.tasks.byParent[task.parent]
    const i = byParentArray.indexOf(id) // and I should've used a Set here, oh well
    byParentArray[i] = byParentArray[byParentArray.length-1]
    byParentArray.pop()

    delete state.tasks.byId[id]
  },
}

const tasks = generateIndexes([])
const inputValue = ""
const state = {tasks, inputValue}

// TODO: why in the sweet merciful world do I need this
const okUndefined = fn => (state, ...rest) => {
  if (typeof state === 'undefined')
    return null
  return fn(state, ...rest)
}
const reducer = okUndefined(createReducer(state, _reducers))

const store = configureStore({ reducer, preloadedState: state })

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <List />
        </div>
      </Provider>
    );
  }
}

const getTasks = () => dispatch => {
  axios.get('/api/tasks')
    .then(res => {
      if (res.status !== 200)
        throw res
      const tasks = generateIndexes(res.data)
      dispatch(getTasksRecv({tasks}))
    })
}
store.dispatch(getTasks())

export default App;
