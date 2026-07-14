import { useState, useEffect } from 'react';
import axios from 'axios';

let cached = null;

export default function useDropdownData() {
  const [classList, setClassList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);

  useEffect(() => {
    if (cached) {
      setClassList(cached.classes);
      setSubjectList(cached.subjects);
      return;
    }
    axios.get('/api/ai/list-classes').then(r => {
      const data = r.data.data || { classes: [], subjects: [] };
      cached = data;
      setClassList(data.classes);
      setSubjectList(data.subjects);
    }).catch(() => {});
  }, []);

  return { classList, subjectList };
}
