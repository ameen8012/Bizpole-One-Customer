import { useState } from "react";

/**
 * BusinessQuizWizard
 * - Step-by-step quiz
 * - Exact-match against the decision table
 * - Shows exact matches or closest matches
 */

const questions = [
  { id: "funding", text: "Do you plan to raise external funding?", options: ["Yes", "No"] },
  { id: "ownership", text: "Will you be the sole owner or have partners?", options: ["Sole Owner", "Partners"] },
  { id: "liability", text: "Do you prefer limited liability protection?", options: ["Yes", "No"] },
  { id: "scale", text: "How much do you plan to scale the business?", options: ["Low", "Medium", "High"] },
  // revenue stored as Yes/No (Yes = expect > ₹40L), matching your table
  { id: "revenue", text: "Do you expect annual revenue to exceed ₹40 lakhs?", options: ["Yes", "No"] },
];

/**
 * Exact decision rows derived from your image/table.
 * Note: ownership can be an array to represent "Solo or Partners".
 * Fields are: funding, ownership, liability, scale, revenue  (all strings)
 */
const recommendations = [
  // Row for external funding & limited liability -> Private Ltd (applies to both solo & partners)
  {
    funding: "Yes",
    ownership: ["Sole Owner", "Partners"],
    liability: "Yes",
    scale: "High",
    revenue: "Yes",
    constitution: "Private Limited Company",
    reason: "Best for investment, scale, and limited liability",
  },

  // No funding, sole owner, limited liability, medium scale, <40L => OPC
  {
    funding: "No",
    ownership: "Sole Owner",
    liability: "Yes",
    scale: "Medium",
    revenue: "No",
    constitution: "One Person Company (OPC)",
    reason: "Ideal for solo entrepreneur with some protection",
  },

  // No funding, sole owner, no liability, low scale, <40L => Sole Proprietorship
  {
    funding: "No",
    ownership: "Sole Owner",
    liability: "No",
    scale: "Low",
    revenue: "No",
    constitution: "Sole Proprietorship",
    reason: "Simplest, easy to start, but no liability protection",
  },

  // No funding, partners, limited liability, medium scale, <40L => LLP
  {
    funding: "No",
    ownership: "Partners",
    liability: "Yes",
    scale: "Medium",
    revenue: "No",
    constitution: "LLP",
    reason: "Safer for partnerships with protection",
  },

  // No funding, partners, no liability, low scale, <40L => Partnership Firm
  {
    funding: "No",
    ownership: "Partners",
    liability: "No",
    scale: "Low",
    revenue: "No",
    constitution: "Partnership Firm",
    reason: "Traditional setup, but full liability",
  },

  // No funding, sole owner, limited liability, medium scale, >=40L => OPC or Private Ltd
  {
    funding: "No",
    ownership: "Sole Owner",
    liability: "Yes",
    scale: "Medium",
    revenue: "Yes",
    constitution: "OPC or Private Ltd",
    reason: "Depends on future plans — both allowed higher turnover",
  },

  // No funding, partners, limited liability, high scale, >=40L => LLP or Private Ltd
  {
    funding: "No",
    ownership: "Partners",
    liability: "Yes",
    scale: "High",
    revenue: "Yes",
    constitution: "LLP or Private Ltd",
    reason: "LLP OK, Pvt Ltd better for scale and external credibility",
  },

  // No funding, sole owner, limited liability, high scale, >=40L => Private Ltd
  {
    funding: "No",
    ownership: "Sole Owner",
    liability: "Yes",
    scale: "High",
    revenue: "Yes",
    constitution: "Private Ltd",
    reason: "Safer with liability and credibility",
  },

  // Funding yes + partners (high scale + revenue) => Private Ltd
  {
    funding: "Yes",
    ownership: "Partners",
    liability: "Yes",
    scale: "High",
    revenue: "Yes",
    constitution: "Private Ltd",
    reason: "Investors demand corporate structure",
  },

  // Funding yes + sole owner (high scale + revenue) => Private Ltd (OPC not suitable for external funding)
  {
    funding: "Yes",
    ownership: "Sole Owner",
    liability: "Yes",
    scale: "High",
    revenue: "Yes",
    constitution: "Private Ltd",
    reason: "OPC not suitable for external funding; Private Ltd preferred",
  },
];

/* helpers */
function fieldMatches(recField, answer) {
  if (Array.isArray(recField)) return recField.includes(answer);
  return recField === answer;
}

function countMatches(rec, answers) {
  let count = 0;
  if (rec.funding === answers.funding) count++;
  if (Array.isArray(rec.ownership)) {
    if (rec.ownership.includes(answers.ownership)) count++;
  } else {
    if (rec.ownership === answers.ownership) count++;
  }
  if (rec.liability === answers.liability) count++;
  if (rec.scale === answers.scale) count++;
  if (rec.revenue === answers.revenue) count++;
  return count;
}

export default function BusinessQuizWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [exactMatches, setExactMatches] = useState([]);
  const [closest, setClosest] = useState([]);

  function selectAnswer(qId, value) {
    setAnswers((p) => ({ ...p, [qId]: value }));
  }

  function next() {
    if (!answers[questions[step].id]) return;
    setStep((s) => Math.min(s + 1, questions.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function evaluate() {
    // ensure all answered
    const allAnswered = questions.every((q) => answers[q.id] !== undefined);
    if (!allAnswered) {
      alert("Please answer all questions first.");
      return;
    }

    // find exact matches
    const exact = recommendations.filter(
      (rec) =>
        fieldMatches(rec.funding, answers.funding) &&
        fieldMatches(rec.ownership, answers.ownership) &&
        fieldMatches(rec.liability, answers.liability) &&
        fieldMatches(rec.scale, answers.scale) &&
        fieldMatches(rec.revenue, answers.revenue)
    );

    setExactMatches(exact);

    // compute closest (top 3 by matching fields)
    const scored = recommendations
      .map((rec) => ({ rec, score: countMatches(rec, answers) }))
      .sort((a, b) => b.score - a.score);

    const top = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => ({ ...s.rec, matchedFields: s.score }));
    setClosest(top);

    setDone(true);
  }

  function reset() {
    setAnswers({});
    setStep(0);
    setDone(false);
    setExactMatches([]);
    setClosest([]);
  }

  return (
    <div className="max-w-2xl mx-auto p-6 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-center">Business Structure Quiz (step-by-step)</h2>

      {!done ? (
        <>
          <div className="mb-4">
            <div className="text-sm text-gray-500">Step {step + 1} of {questions.length}</div>
            <p className="mt-2 font-medium">{questions[step].text}</p>
          </div>

          <div className="flex gap-3 flex-wrap mb-6">
            {questions[step].options.map((opt) => {
              const id = questions[step].id;
              const selected = answers[id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(id, opt)}
                  className={`px-4 py-2 rounded-lg border ${selected ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button onClick={back} disabled={step === 0} className="px-4 py-2 rounded border disabled:opacity-50">
              Back
            </button>

            {step < questions.length - 1 ? (
              <button
                onClick={next}
                disabled={!answers[questions[step].id]}
                className="ml-auto px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={evaluate}
                disabled={!answers[questions[step].id]}
                className="ml-auto px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
              >
                See Recommendation
              </button>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <strong>Quick preview of your answers:</strong>
            <div className="mt-2">
              {questions.map((q) => (
                <div key={q.id} className="flex gap-2">
                  <div className="w-36 text-gray-700">{q.text}</div>
                  <div className="font-medium">{answers[q.id] ?? "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Your answers</h3>
            <div className="mt-2">
              {questions.map((q) => (
                <div key={q.id} className="flex gap-2">
                  <div className="w-40 text-gray-600">{q.text}</div>
                  <div className="font-medium">{answers[q.id]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-semibold">Recommendation</h3>

            {exactMatches.length > 0 ? (
              exactMatches.map((m, i) => (
                <div key={i} className="mt-3 p-3 border rounded bg-green-50">
                  <div className="text-lg font-bold">{m.constitution}</div>
                  <div className="text-sm text-gray-700 mt-1">{m.reason}</div>
                </div>
              ))
            ) : (
              <div className="mt-3 p-3 border rounded bg-yellow-50">
                <div className="font-semibold">No exact match found in the table.</div>
                <div className="text-sm text-gray-700 mt-1">Showing closest matches below (ranked):</div>
              </div>
            )}
          </div>

          {closest.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Closest matches</h3>
              <div className="mt-2 space-y-2">
                {closest.map((c, idx) => (
                  <div key={idx} className="p-3 border rounded">
                    <div className="font-medium">{c.constitution} <span className="text-xs text-gray-500">({c.matchedFields}/5 fields match)</span></div>
                    <div className="text-sm text-gray-700">{c.reason}</div>
                    <div className="text-xs text-gray-500 mt-1">Row values: funding={c.funding}, ownership={Array.isArray(c.ownership) ? c.ownership.join(" / ") : c.ownership}, liability={c.liability}, scale={c.scale}, revenue={c.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 rounded border">Start Over</button>
          </div>
        </>
      )}
    </div>
  );
}
