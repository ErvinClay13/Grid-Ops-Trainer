/**
 * api/coach.js
 * -------------
 * THE IDEA:
 * After a trainee submits an answer to a scenario and we've already computed
 * the correct result (using the pure math in logic/), this route sends that
 * result to Claude and asks for a short, mentor-style explanation of WHY the
 * answer is what it is — the kind of context a senior engineer would give a
 * new hire on the job, not just a pass/fail grade.
 *
 * This route does NOT do any of its own engineering math. It only:
 *   1. Validates the incoming request
 *   2. Builds a prompt describing the scenario + the already-computed result
 *   3. Sends that prompt to Claude
 *   4. Returns Claude's explanation to the frontend
 *
 * SECURITY: same pattern as Grid Toolkit — the ANTHROPIC_API_KEY only ever
 * lives on this server (via lib/claudeClient.js), never sent to the browser.
 *
 * EXPECTED REQUEST BODY:
 * {
 *   "scenarioType": "restoration" | "loadCheck" | "voltageDrop" | "derImpact",
 *   "result": { ... },              // whatever the matching /api/evaluate/* route returned
 *   "traineeReasoning": "optional string — what the trainee THOUGHT before seeing the answer"
 * }
 */

const express = require("express");
const router = express.Router();
const { client, MODEL } = require("../lib/claudeClient");

// Human-readable description of each scenario, used to give Claude context.
// Keeping this centralized means if you add a 5th scenario later, you only
// need to add one entry here rather than rewriting prompt logic.
const SCENARIO_CONTEXT = {
  restoration:
    "A storm restoration prioritization scenario. Critical facilities (hospitals, etc.) are always restored first; otherwise sites are ranked by customers restored per crew-hour of repair time.",
  loadCheck:
    "A feeder/transformer load capacity scenario. Checks whether adding new load (e.g. EV chargers) pushes total demand past 80% of rated capacity, after applying a diversity factor to existing connected loads.",
  voltageDrop:
    "A voltage drop scenario for a conductor run. Checks whether percent voltage drop over a given wire size and length stays under a 5% limit.",
  derImpact:
    "A DER/solar interconnection scenario. Checks for reverse power flow risk (solar capacity vs. minimum daytime circuit load) and whether the proposed solar size exceeds a 15% fast-track screening threshold.",
};

const VALID_SCENARIO_TYPES = Object.keys(SCENARIO_CONTEXT);

function validateCoachInput(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Request body must be an object.");
  }
  if (!VALID_SCENARIO_TYPES.includes(body.scenarioType)) {
    throw new Error(
      `"scenarioType" must be one of: ${VALID_SCENARIO_TYPES.join(", ")}`
    );
  }
  if (!body.result || typeof body.result !== "object") {
    throw new Error('"result" is required and must be the object returned by the matching /api/evaluate/* route.');
  }
  // traineeReasoning is optional, but if present, must be a string
  if (body.traineeReasoning !== undefined && typeof body.traineeReasoning !== "string") {
    throw new Error('"traineeReasoning" must be a string if provided.');
  }
}

// POST /api/coach
router.post("/", async (req, res) => {
  try {
    validateCoachInput(req.body);

    const { scenarioType, result, traineeReasoning } = req.body;
    const scenarioDescription = SCENARIO_CONTEXT[scenarioType];

    // Build the prompt. We hand Claude the ALREADY-COMPUTED correct result —
    // Claude is not being asked to do the engineering math itself, only to
    // explain it clearly. This keeps the actual grading deterministic and
    // trustworthy (it comes from logic/, not from an LLM), while using
    // Claude for the part it's actually good at: teaching.
    const promptParts = [
      `You are a senior utility engineer mentoring a new hire preparing for a job at ComEd.`,
      `Scenario type: ${scenarioDescription}`,
      `Here is the computed result of this scenario: ${JSON.stringify(result)}`,
    ];

    if (traineeReasoning) {
      promptParts.push(
        `The trainee's own reasoning before seeing the answer was: "${traineeReasoning}"`
      );
      promptParts.push(
        `Compare their reasoning to the correct result. Point out what they got right, and gently correct any misunderstanding.`
      );
    } else {
      promptParts.push(
        `Explain WHY this is the correct result in plain language, as if coaching someone new to the job.`
      );
    }

    promptParts.push(
      `Keep your response to 3-5 sentences. Be encouraging but precise. Avoid restating raw numbers that are already visible in the result — focus on the REASONING.`
    );

    const prompt = promptParts.join("\n\n");

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    // response.content is an array of blocks (usually just one "text" block
    // for a simple prompt like this) — same shape you already handled in
    // Grid Toolkit's Grid Assistant chat route.
    const feedbackText = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    res.json({ success: true, feedback: feedbackText });
  } catch (error) {
    // Validation errors (bad input) vs. Anthropic API errors both land here.
    // In production you may want to distinguish these with different status
    // codes, but 400 is a reasonable default for a training tool.
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;