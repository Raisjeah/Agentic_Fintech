from core.llm import get_llm_client, LLMProvider

async def discuss(analysis_id: str, question: str, analysis: dict) -> str:
    """
    Inject full analysis context ke LLM,
    lalu jawab pertanyaan user tentang analisis itu.
    """
    context = f"""
    Kamu adalah AI Research Desk yang baru menyelesaikan analisis:
    
    Asset: {analysis.get('asset')}
    Timeframe: {analysis.get('timeframe')}
    Bias: {analysis.get('report', {}).get('overall_bias')}
    Confidence: {analysis.get('report', {}).get('confidence')}%
    
    Technical: {analysis.get('report', {}).get('sources', {}).get('technical')}
    Sentiment: {analysis.get('report', {}).get('sources', {}).get('sentiment')}
    News: {analysis.get('report', {}).get('sources', {}).get('news')}
    Macro: {analysis.get('report', {}).get('sources', {}).get('macro')}
    
    Trade Plan:
    Entry: {analysis.get('report', {}).get('entry_plan')}
    SL: {analysis.get('report', {}).get('stop_loss')}
    TP: {analysis.get('report', {}).get('take_profit')}
    
    Scenarios: {analysis.get('report', {}).get('scenarios')}
    Risk Flags: {analysis.get('report', {}).get('risk_flags')}
    """
    
    client = get_llm_client(LLMProvider.GEMINI)
    if not client:
        return "GEMINI_API_KEY tidak dikonfigurasi. Tidak dapat memproses pertanyaan."
        
    try:
        import asyncio
        def run_gen():
            return client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[
                    {"role": "user", "parts": [{"text": f"{context}\n\nJawablah sebagai assistant pro. Pertanyaan User: {question}"}]}
                ]
            )
        response = await asyncio.to_thread(run_gen)
        return response.text
    except Exception as e:
        return f"Gagal memproses dengan Gemini: {str(e)}"
