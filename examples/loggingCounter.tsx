import { useState, useRef, useEffect } from 'react';

const Counter = () => {
	const [count, setCount] = useState(0);
	const countRef = useRef(count);

	useEffect(() => {
		countRef.current = count;
	}, [count]);

	useEffect(() => {
		const logCount = () => {
			console.log(`Count: ${countRef.current}`);
		};

		const interval = setInterval(logCount, 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	const incrementCount = () => {
		setCount(count + 1);
	};

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={incrementCount}>Increment</button>
		</div>
	);
};
