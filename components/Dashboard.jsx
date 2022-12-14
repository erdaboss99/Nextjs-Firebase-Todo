import React, { useState } from 'react';
import { deleteField, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import useFetchTodos from '../hooks/fetchTodos';
import TodoCard from './TodoCard';

const Dashboard = () => {
	const { currentUser } = useAuth();
	const [edit, setEdit] = useState(null);
	const [todo, setTodo] = useState('');
	const [edittedValue, setEdittedValue] = useState('');

	const { todos, setTodos, loading, error } = useFetchTodos();

	const handleAddTodo = async () => {
		if (!todo) {
			return;
		}
		const newKey = Object.keys(todos).length === 0 ? 1 : Math.max(...Object.keys(todos)) + 1;
		setTodos({ ...todos, [newKey]: todo });
		const userRef = doc(db, 'users', currentUser.uid);
		await setDoc(
			userRef,
			{
				todos: {
					[newKey]: todo,
				},
			},
			{ merge: true },
		);
		setTodo('');
	};

	const handleEditTodo = async () => {
		if (!edittedValue) {
			return;
		}
		const newKey = edit;
		setTodos({ ...todos, [newKey]: edittedValue });
		const userRef = doc(db, 'users', currentUser.uid);
		await setDoc(
			userRef,
			{
				todos: {
					[newKey]: edittedValue,
				},
			},
			{ merge: true },
		);
		setEdit(null);
		setEdittedValue('');
	};

	const handleAddEdit = (todoKey) => {
		return () => {
			setEdit(todoKey);
			setEdittedValue(todos[todoKey]);
		};
	};

	const handleDelete = (todoKey) => {
		return async () => {
			const tempObj = { ...todos };
			delete tempObj[todoKey];

			setTodos(tempObj);
			const userRef = doc(db, 'users', currentUser.uid);
			await setDoc(
				userRef,
				{
					todos: {
						[todoKey]: deleteField(),
					},
				},
				{ merge: true },
			);
		};
	};

	return (
		<div className='w-full max-w-[65ch] text-xs sm:text-sm mx-auto flex flex-col flex-1 gap-3 sm:gap-5'>
			<div className='flex items-stretch'>
				<input
					type='text'
					placeholder='Enter TODO'
					value={todo}
					onChange={(e) => setTodo(e.target.value)}
					className='outline-none p-3 text-base sm:text-lg text-slate-900 flex-1'
				/>
				<button
					onClick={handleAddTodo}
					className='uppercase w-fit px-4 sm:px-6 py-2 sm:py-3 bg-amber-400 text-white font-medium text-base duration-300 hover:opacity-40'>
					Add
				</button>
			</div>
			{error && (
				<div className='w-full border-rose-400 border border-solid text-rose-400 text-center py-2'>
					{error}
				</div>
			)}
			{loading && (
				<div className='flex-1 grid place-items-center'>
					<i className='fa-solid fa-spinner animate-spin text-6xl'></i>
				</div>
			)}
			{!loading && (
				<>
					{Object.keys(todos).map((todo, i) => {
						return (
							<TodoCard
								key={i}
								handleEditTodo={handleEditTodo}
								handleAddEdit={handleAddEdit}
								edit={edit}
								todoKey={todo}
								edittedValue={edittedValue}
								setEdittedValue={setEdittedValue}
								handleDelete={handleDelete}>
								{todos[todo]}
							</TodoCard>
						);
					})}
				</>
			)}
		</div>
	);
};

export default Dashboard;
