import { useState, useEffect } from 'react';
import Papa from 'papaparse';

let cachedDemographics = null;
let cachedThemes = null;
let isFetching = false;
let fetchPromise = null;

export const THEME_TRANSLATIONS = {
  'New Knowledge & Learning Gains': 'ចំណេះដឹងថ្មី & ការរៀនសូត្រ',
  'Creativity & Critical Thinking': 'ភាពច្នៃប្រឌិត & ការគិត',
  'Social Connection & Collaboration': 'ទំនាក់ទំនងសង្គម & ការសហការ',
  'Academic Motivation & Engagement': 'ការជំរុញទឹកចិត្ត & ការចូលរួម',
  'Digital Skills': 'ជំនាញឌីជីថល',
  'General Positive Sentiment': 'មតិយោបល់វិជ្ជមានទូទៅ',
  'Facility & Environment Satisfaction': 'ការពេញចិត្តលើបរិក្ខារ',
  'Research & Information Literacy': 'ការស្រាវជ្រាវ & ព័ត៌មាន',
  'Confidence & Courage': 'ទំនុកចិត្ត & ភាពក្លាហាន',
  'Efficiency & Time-Saving': 'ចំណេញពេល & ប្រសិទ្ធភាព',
  'Career Readiness': 'ការត្រៀមខ្លួនសម្រាប់អាជីព',
  'Discipline & Character': 'វិន័យ & អត្តចរិត',
  'Personal Growth & Self-Development': 'ការលូតលាស់ផ្ទាល់ខ្លួន',
  'Modernization & Tech-Savvy': 'ភាពទំនើបផ្នែកបច្ចេកវិទ្យា',
  'Communication & Language Skills': 'ជំនាញទំនាក់ទំនង & ភាសា',
  'Coding & Advanced Tech': 'ការសរសេរកូដ & បច្ចេកវិទ្យាខ្ពស់',
  'Free Access & Financial Benefits': 'ការប្រើប្រាស់ឥតគិតថ្លៃ',
  'AI Literacy': 'ចំណេះដឹង AI',
  'Health, Physical & Mental Strain': 'បញ្ហាសុខភាពកាយ & ចិត្ត',
  'No Negative Impact Reported': 'គ្មានផលប៉ះពាល់អវិជ្ជមាន',
  'Equipment, Facility & Environment Issues': 'បញ្ហាបរិក្ខារ & បរិស្ថាន',
  'Time Consumption & Distraction': 'ការរំខាន & ចំណាយពេល',
  'Language Barrier': 'របាំងភាសា',
  'Complexity & Difficulty': 'ភាពស្មុគស្មាញ',
  'Technical & Internet Issues': 'បញ្ហាបច្ចេកទេស & អ៊ីនធឺណិត',
  'Schedule, Cost & Management Issues': 'បញ្ហាកាលវិភាគ & ការគ្រប់គ្រង',
  'No Suggestion Reported': 'គ្មានសំណូមពរ',
  'Teaching & Pedagogy': 'ការបង្រៀន & គរុកោសល្យ',
  'Equipment & Facility': 'បរិក្ខារ & ទីកន្លែង',
  'Hardware, Equipment & Facility': 'បរិក្ខារ & ទីកន្លែង',
  'Teaching Methods & Curriculum': 'វិធីសាស្ត្របង្រៀន & កម្មវិធីសិក្សា',
  'Environment, Cleanliness & Comfort': 'បរិស្ថាន ភាពស្អាត & ផាសុកភាព',
  'Knowledge & Ease of Learning': 'ចំណេះដឹង & ការរៀនសូត្រ',
  'Teaching Quality & Pedagogy': 'គុណភាពបង្រៀន & គរុកោសល្យ',
  'Technology & Practical Skills': 'បច្ចេកវិទ្យា & ជំនាញអនុវត្ត',
  'Other / Unclassified': 'ផ្សេងៗ',
  'Unclassified / No Meaningful Response': 'មិនអាចចាត់ថ្នាក់បាន',
  'Post Office': 'សេវាប្រៃសណីយ៍',
  'Not Used': 'មិនធ្លាប់ប្រើប្រាស់',
  'Coffee Shop': 'ហាងកាហ្វេ',
  'Short Courses': 'វគ្គសិក្សាខ្លីៗ',
  'Library': 'បណ្ណាល័យ',
  'Meeting Room': 'បន្ទប់ប្រជុំ',
  'Discipline, Environment & Space': 'វិន័យ បរិស្ថាន & ទីកន្លែង',
  'Hardware & Equipment Upgrades': 'ការធ្វើឱ្យប្រសើរឡើងផ្នែកបរិក្ខារ'
};

export const translateTheme = (theme) => {
  if (!theme) return '';
  const trimmed = theme.trim();
  return THEME_TRANSLATIONS[trimmed] || trimmed;
};

export function useStudentData() {
  const [data, setData] = useState({ demographics: [], themes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cachedDemographics && cachedThemes) {
      setData({ demographics: cachedDemographics, themes: cachedThemes });
      setLoading(false);
      return;
    }

    if (!isFetching) {
      isFetching = true;
      fetchPromise = Promise.all([
        new Promise((resolve) => {
          Papa.parse('/Data/student_ctc/PowerBI_Demographics.csv', {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              cachedDemographics = results.data;
              resolve();
            }
          });
        }),
        new Promise((resolve) => {
          Papa.parse('/Data/student_ctc/PowerBI_Themes.csv', {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              cachedThemes = results.data;
              resolve();
            }
          });
        })
      ]).then(() => {
        isFetching = false;
        setData({ demographics: cachedDemographics, themes: cachedThemes });
        setLoading(false);
      });
    } else {
      fetchPromise.then(() => {
        setData({ demographics: cachedDemographics, themes: cachedThemes });
        setLoading(false);
      });
    }
  }, []);

  return { data, loading };
}
