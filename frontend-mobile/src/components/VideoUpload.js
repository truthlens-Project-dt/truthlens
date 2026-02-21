const [modelInfo, setModelInfo] = useState(null);

useEffect(() => {
  axios.get('http://localhost:8000/api/v1/health')
    .then(r => setModelInfo(r.data))
    .catch(() => {});
}, []);