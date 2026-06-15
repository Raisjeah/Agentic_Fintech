from core.llm import get_llm_client, LLMProvider
from core.db import db_client

async def discuss(analysis_id: str, question: str, analysis: dict) -> str:
    """
    Inject full analysis context and chat history to LLM,
    then answer the user's question and save to DB.
    """
    context = f"""
    Kamu adalah AI Research Desk yang baru menyelesaikan analisis:
    
    Asset: {analysis.get('asset')}
    Timeframe: {analysis.get('timeframe')}
    Bias: {analysis.get('report', {}).get('overall_bias') if isinstance(analysis.get('report'), dict) else getattr(analysis.get('report', {}), 'overall_bias', 'NEUTRAL')}
    Confidence: {analysis.get('report', {}).get('confidence') if isinstance(analysis.get('report'), dict) else getattr(analysis.get('report', {}), 'confidence', 50)}%
    
    Technical: {analysis.get('report', {}).get('sources', {}).get('technical') if isinstance(analysis.get('report'), dict) else ''}
    Sentiment: {analysis.get('report', {}).get('sources', {}).get('sentiment') if isinstance(analysis.get('report'), dict) else ''}
    News: {analysis.get('report', {}).get('sources', {}).get('news') if isinstance(analysis.get('report'), dict) else ''}
    Macro: {analysis.get('report', {}).get('sources', {}).get('macro') if isinstance(analysis.get('report'), dict) else ''}
    
    Trade Plan:
    Entry: {analysis.get('report', {}).get('entry_plan') if isinstance(analysis.get('report'), dict) else ''}
    SL: {analysis.get('report', {}).get('stop_loss') if isinstance(analysis.get('report'), dict) else ''}
    TP: {analysis.get('report', {}).get('take_profit') if isinstance(analysis.get('report'), dict) else ''}
    
    Scenarios: {analysis.get('report', {}).get('scenarios') if isinstance(analysis.get('report'), dict) else ''}
    Risk Flags: {analysis.get('report', {}).get('risk_flags') if isinstance(analysis.get('report'), dict) else ''}
    """
    
    # Load chat history from DB
    history_str = ""
    try:
        chat_doc = await db_client.chats.find_one({"analysis_id": analysis_id})
        if chat_doc and "messages" in chat_doc:
            for msg in chat_doc["messages"]:
                role_label = "User" if msg["role"] == "user" else "Assistant"
                history_str += f"{role_label}: {msg['text']}\n"
    except Exception as e:
        print(f"Failed to load chat history: {e}")

    client = get_llm_client(LLMProvider.GEMINI)
    if not client:
        return "GEMINI_API_KEY tidak dikonfigurasi. Tidak dapat memproses pertanyaan."
        
    try:
        import asyncio
        prompt_text = f"{context}\n\nRiwayat Percakapan Sebelumnya:\n{history_str}\n\nJawablah sebagai assistant pro. Pertanyaan User: {question}"
        response = await asyncio.to_thread(client.generate, prompt_text)
        
        # Save new messages to DB
        try:
            await db_client.chats.update_one(
                {"analysis_id": analysis_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                {"role": "user", "text": question},
                                {"role": "ai", "text": response}
                            ]
                        }
                    }
                },
                upsert=True
            )
        except Exception as db_err:
            print(f"Failed to save chat to DB: {db_err}")
            
        return response
    except Exception as e:
        return f"Gagal memproses dengan Gemini: {str(e)}"
