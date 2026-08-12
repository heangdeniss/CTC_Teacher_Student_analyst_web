import { useMemo } from 'react';

export function useTeacherData(filteredData, language, translateData) {
  const totalRespondents = filteredData.length;

  const avgAge = useMemo(() => {
    const validAges = filteredData.map(d => parseFloat(d['អាយុ៖'])).filter(a => !isNaN(a));
    if (validAges.length === 0) return 0;
    return (validAges.reduce((a, b) => a + b, 0) / validAges.length).toFixed(1);
  }, [filteredData]);

  const topSubject = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      const s = row['Structure មុខវិជ្ជាបង្រៀន៖'] || 'ផ្សេងៗ';
      counts[s] = (counts[s] || 0) + 1;
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return sorted.length > 0 ? translateData(sorted[0], language) : 'N/A';
  }, [filteredData, language, translateData]);

  const topAITool = useMemo(() => {
    const counts = {};
    filteredData.forEach(r => {
      const tool = r['Structure សូមសរសេរឈ្មោះឧបករណ៍ AI ដែលលោកគ្រូ/អ្នកគ្រូ ប្រើប្រាស់ញឹកញាប់ជាងគេ'] || 'មិនប្រើប្រាស់';
      counts[tool] = (counts[tool] || 0) + 1;
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const top = sorted[0] === 'ផ្សេងៗ / មិនមាន' && sorted.length > 1 ? sorted[1] : sorted[0];
    return top ? translateData(top, language) : 'N/A';
  }, [filteredData, language, translateData]);

  const genderData = useMemo(() => {
    const counts = { 'ប្រុស': 0, 'ស្រី': 0, 'ផ្សេងៗ': 0 };
    filteredData.forEach(row => {
      const g = row['ភេទ']?.trim().replace(/\u200b/g, '');
      if (g === 'ប្រុស' || g === 'ស្រី') counts[g]++;
      else counts['ផ្សេងៗ']++;
    });
    return Object.entries(counts).filter(([_, v]) => v > 0).map(([name, value]) => ({ name: translateData(name, language), value }));
  }, [filteredData, language, translateData]);

  const ageData = useMemo(() => {
    const bins = { '20-25': 0, '26-30': 0, '31-35': 0, '36-40': 0, '41-45': 0, '46-50': 0, '51-55': 0, '56-60': 0, '60+': 0, 'មិនបានបំពេញ': 0 };
    filteredData.forEach(row => {
      const ageRaw = row['អាយុ៖'];
      if (!ageRaw || ageRaw.toString().trim() === '') bins['មិនបានបំពេញ']++;
      else {
        const age = parseFloat(ageRaw);
        if (isNaN(age)) bins['មិនបានបំពេញ']++;
        else {
          if (age <= 25) bins['20-25']++;
          else if (age <= 30) bins['26-30']++;
          else if (age <= 35) bins['31-35']++;
          else if (age <= 40) bins['36-40']++;
          else if (age <= 45) bins['41-45']++;
          else if (age <= 50) bins['46-50']++;
          else if (age <= 55) bins['51-55']++;
          else if (age <= 60) bins['56-60']++;
          else bins['60+']++;
        }
      }
    });
    return Object.entries(bins).filter(([_, value]) => value > 0).map(([name, value]) => ({ name: translateData(name, language), value }));
  }, [filteredData, language, translateData]);

  const instData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let inst = row['Structure តើ ម.ប.ស. ជាកម្មសិទ្ធរបស់ស្ថាប័នណា?'];
      if (!inst || inst.trim() === '') inst = 'មិនដឹង';
      counts[inst] = (counts[inst] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: translateData(name, language), value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredData, language, translateData]);

  const schoolData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let s = row['មកពីវិទ្យាល័យ'];
      if (!s || s.trim() === '') s = 'ផ្សេងៗ';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: translateData(name, language), value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData, language, translateData]);

  const aiToolData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let tool = row['Structure សូមសរសេរឈ្មោះឧបករណ៍ AI ដែលលោកគ្រូ/អ្នកគ្រូ ប្រើប្រាស់ញឹកញាប់ជាងគេ'];
      if (!tool || tool.trim() === '') tool = 'មិនមាន';
      if (tool === 'ផ្សេងៗ / មិនមាន') tool = 'មិនមាន/ផ្សេងៗ';
      counts[tool] = (counts[tool] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: translateData(name, language), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [filteredData, language, translateData]);

  const subjectData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let subj = row['Structure មុខវិជ្ជាបង្រៀន៖'];
      if (!subj || subj.trim() === '') subj = 'ផ្សេងៗ';
      counts[subj] = (counts[subj] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: translateData(name, language), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredData, language, translateData]);

  const devicesData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let devicesRaw = row['ឧបករណ៍ឌីជីថលដែលមានប្រើប្រាស់៖'];
      if (!devicesRaw || devicesRaw.trim() === '' || devicesRaw.includes('មិនមាន') || devicesRaw.includes('គ្មាន')) {
        counts['មិនមាន'] = (counts['មិនមាន'] || 0) + 1;
        return;
      }

      let devices = devicesRaw.split(';').map(d => d.trim()).filter(Boolean).sort();
      let rawLabel = devices.join('|');
      counts[rawLabel] = (counts[rawLabel] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([rawLabel, value]) => {
        if (rawLabel === 'មិនមាន') return { name: translateData('មិនមាន', language), value };
        let devices = rawLabel.split('|').map(d => translateData(d, language));
        let label = '';
        if (language === 'en') {
          if (devices.length === 1) label = devices[0];
          else if (devices.length === 2) label = devices.join(' and ');
          else {
            const last = devices.pop();
            label = devices.join(', ') + ', and ' + last;
          }
        } else {
          if (devices.length === 1) label = devices[0];
          else if (devices.length === 2) label = devices.join(' និង ');
          else {
            const last = devices.pop();
            label = devices.join(', ') + ' និង ' + last;
          }
        }
        return { name: label, value };
      })
      .sort((a, b) => b.value - a.value);
  }, [filteredData, language, translateData]);

  const desiredSubjectsData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let subj = row['Structure មុខវិជ្ជាឌីជីថលណាខ្លះដែលលោកគ្រូ/អ្នកគ្រូចង់សិក្សាបន្ថែម'];
      if (!subj || subj.trim() === '') subj = 'មិនបានបំពេញ';
      counts[subj] = (counts[subj] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: translateData(name, language), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredData, language, translateData]);

  const supportNeedsData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let need = row['Structure តើគួររៀបចំ ម.ប.ស. យ៉ាងដូចម្តេចខ្លះដើម្បីអាចជួយគាំទ្រដល់ការងារលោកគ្រូ/អ្នកគ្រូ?'];
      if (!need || need.trim() === '') need = 'គ្មានយោបល់';
      counts[need] = (counts[need] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: translateData(name, language), value }))
      .sort((a, b) => b.value - a.value)
      .filter(item => item.name !== 'គ្មានយោបល់' && item.name !== 'មិនបានបំពេញ')
      .slice(0, 6);
  }, [filteredData, language, translateData]);

  const improvementsData = useMemo(() => {
    const counts = {};
    filteredData.forEach(row => {
      let imp = row['Structure តើលោកគ្រូ/អ្នកគ្រូ គិតថា ម.ប.ស. គួរកែលម្អលើចំណុចអ្វីខ្លះ?'];
      if (!imp || imp.trim() === '') imp = 'គ្មានយោបល់';
      counts[imp] = (counts[imp] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: translateData(name, language), value }))
      .sort((a, b) => b.value - a.value)
      .filter(item => item.name !== 'គ្មានយោបល់' && item.name !== 'មិនបានបំពេញ')
      .slice(0, 6);
  }, [filteredData, language, translateData]);

  return {
    totalRespondents,
    avgAge,
    topSubject,
    topAITool,
    genderData,
    ageData,
    instData,
    schoolData,
    aiToolData,
    subjectData,
    devicesData,
    desiredSubjectsData,
    supportNeedsData,
    improvementsData,
  };
}
