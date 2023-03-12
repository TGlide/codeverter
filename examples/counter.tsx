const Count = () => {
	const [count, setCount] = useState(0);
	return (
		<button className="btn" onClick={() => setCount(count + 1)}>
			Count: {count}
		</button>
	);
};
