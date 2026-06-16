const db = require('../config/db');
const geminiService = require('../services/geminiService');

/**
 * Analyze symptoms using Gemini and store the result
 */
async function analyzeSymptoms(req, res) {
  const { symptoms } = req.body;
  const userId = req.user.id;

  if (!symptoms || symptoms.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Please provide symptoms for analysis.'
    });
  }

  try {
    // 1. Analyze symptoms using Gemini API
    const aiAnalysis = await geminiService.analyzeSymptoms(symptoms);

    // 2. Save the details to database
    // ai_response is stored as JSON, so we pass stringified JSON
    const query = `
      INSERT INTO symptom_history (user_id, symptoms, ai_response) 
      VALUES (?, ?, ?)
    `;
    const insertResult = await db.query(query, [
      userId,
      symptoms,
      JSON.stringify(aiAnalysis)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Symptoms analyzed and recorded successfully.',
      analysisId: insertResult.insertId,
      symptoms,
      aiResponse: aiAnalysis,
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze symptoms. Please try again later.'
    });
  }
}

/**
 * Retrieve current user's history of analyses
 */
async function getHistory(req, res) {
  const userId = req.user.id;

  try {
    const query = `
      SELECT id, symptoms, ai_response, created_at 
      FROM symptom_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    const history = await db.query(query, [userId]);

    // Format MySQL output JSON string back into objects for response
    const formattedHistory = history.map(item => {
      let aiResponse = item.ai_response;
      if (typeof aiResponse === 'string') {
        try {
          aiResponse = JSON.parse(aiResponse);
        } catch (e) {
          console.error('Error parsing JSON from db:', e);
        }
      }
      return {
        id: item.id,
        symptoms: item.symptoms,
        aiResponse,
        createdAt: item.created_at
      };
    });

    return res.status(200).json({
      success: true,
      history: formattedHistory
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis history.'
    });
  }
}

/**
 * Delete a history entry
 */
async function deleteHistory(req, res) {
  const userId = req.user.id;
  const historyId = req.params.id;

  try {
    // Verify the record belongs to the user before deleting
    const checkQuery = 'SELECT id FROM symptom_history WHERE id = ? AND user_id = ?';
    const records = await db.query(checkQuery, [historyId, userId]);

    if (records.length === 0) {
      return res.status(44) || res.status(404).json({
        success: false,
        message: 'History record not found or access denied.'
      });
    }

    const deleteQuery = 'DELETE FROM symptom_history WHERE id = ?';
    await db.query(deleteQuery, [historyId]);

    return res.status(200).json({
      success: true,
      message: 'History record deleted successfully.'
    });

  } catch (error) {
    console.error('Error deleting history record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete history record.'
    });
  }
}

module.exports = {
  analyzeSymptoms,
  getHistory,
  deleteHistory
};
