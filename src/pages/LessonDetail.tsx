import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadLesson();
    loadQuestions();
  }, [id]);

  const loadLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('lesson_id', id);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: (correct / questions.length) * 100,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{lesson.title}</h1>

      {/* Main Grid Layout: 2/3 left column (video + notes), 1/3 right column (transcript) */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        
        {/* Left Column - Video and Notes */}
        <div className="col-span-2 flex flex-col gap-6">
          
          {/* Video Section */}
          {lesson.video_url && (
            <Card className="h-full">
              <CardContent className="p-6">
                <video
                  className="w-full rounded-lg"
                  controls
                  src={lesson.video_url}
                >
                  Your browser does not support the video tag.
                </video>
              </CardContent>
            </Card>
          )}

          {/* Notes Section - Below Video */}
          <Card className="h-32">
            <CardHeader>
              <CardTitle className="text-lg">Мои заметки</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-20 p-2 border rounded-md resize-none"
                placeholder="Делайте заметки по ходу урока..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Transcript (full height) */}
        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Транскрипция урока</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap">
                {lesson.description || lesson.content}
              </p>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Test Section - Placeholder */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {'lessonTest'}
            </CardTitle>
            {!('lessonTestDescription')}
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
