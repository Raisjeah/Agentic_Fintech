from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from agents.data_agent import data_agent
from agents.technical_agent import technical_agent
from agents.news_agent import news_agent
from agents.sentiment_agent import sentiment_agent
from agents.macro_agent import macro_agent
from agents.risk_agent import risk_agent
from agents.thesis_agent import thesis_agent
from agents.synthesizer import synthesizer_agent
from agents.scenario_agent import scenario_agent
from agents.money_agent import money_agent
from models.schema import TradePlan

from agents.planner import planner_agent
from agents.reviewer import reviewer_agent

from agents.bull_agent import bull_agent
from agents.bear_agent import bear_agent
from agents.debate_moderator import debate_moderator

# State definition
class TradingState(TypedDict):
    # Input
    asset: str
    timeframe: str
    goal: str
    capital: float
    risk_percent: float

    # Outputs
    planner_data: Dict[str, Any]
    market_data: Dict[str, Any]
    tech_data: Dict[str, Any]
    news_data: Dict[str, Any]
    sentiment_data: Dict[str, Any]
    macro_data: Dict[str, Any]
    risk_data: Dict[str, Any]
    bull_data: Dict[str, Any]
    bear_data: Dict[str, Any]
    debate_data: Dict[str, Any]
    thesis_data: Dict[str, Any]
    synthesis_data: Dict[str, Any]
    scenarios_data: Dict[str, Any]
    mm_data: Dict[str, Any]
    
    final_plan: Any # Will be TradePlan object

async def planner_node(state: TradingState):
    plan_out = await planner_agent.create_plan(state["asset"], state["timeframe"], state["goal"], state["capital"], state["risk_percent"])
    return {"planner_data": plan_out}

async def data_node(state: TradingState):
    data_out = await data_agent.fetch_market_data(state["asset"], state["timeframe"])
    return {"market_data": data_out}

async def news_node(state: TradingState):
    news_out = await news_agent.fetch_news(state["asset"], state["timeframe"])
    return {"news_data": news_out}

async def macro_node(state: TradingState):
    macro_out = await macro_agent.fetch_macro(state["asset"], state["timeframe"])
    return {"macro_data": macro_out}

async def tech_node(state: TradingState):
    # Requires market_data
    tech_out = technical_agent.analyze(state["market_data"]["ohlcv"])
    return {"tech_data": tech_out}

async def sentiment_node(state: TradingState):
    # Requires news_data
    sentiment_out = await sentiment_agent.fetch_sentiment(state["asset"], state["news_data"])
    return {"sentiment_data": sentiment_out}

async def risk_node(state: TradingState):
    # Requires market_data, macro_data, news_data
    risk_out = await risk_agent.evaluate_risk(state["asset"], state["market_data"]["ohlcv"], state["macro_data"], state["news_data"])
    return {"risk_data": risk_out}

async def bull_node(state: TradingState):
    bull_out = await bull_agent.argue_bullish(state["asset"], state["tech_data"], state["news_data"], state["sentiment_data"])
    return {"bull_data": bull_out}

async def bear_node(state: TradingState):
    bear_out = await bear_agent.argue_bearish(state["asset"], state["tech_data"], state["macro_data"], state["risk_data"])
    return {"bear_data": bear_out}

async def debate_moderator_node(state: TradingState):
    debate_out = await debate_moderator.moderate(state["asset"], state["bull_data"], state["bear_data"])
    return {"debate_data": debate_out}

async def thesis_node(state: TradingState):
    thesis_out = await thesis_agent.generate_thesis(
        state["asset"], state["market_data"], state["tech_data"], 
        state["news_data"], state["sentiment_data"], state["macro_data"], state["risk_data"]
    )
    return {"thesis_data": thesis_out}

async def synthesizer_node(state: TradingState):
    synth_out = await synthesizer_agent.synthesize(
        state["asset"], state["timeframe"], state["market_data"], 
        state["tech_data"], state["news_data"], state["sentiment_data"], state["macro_data"]
    )
    return {"synthesis_data": synth_out}

async def scenario_node(state: TradingState):
    scen_out = await scenario_agent.generate_scenarios(
        state["asset"], state["market_data"]["current_price"], state["synthesis_data"], state["tech_data"]
    )
    return {"scenarios_data": scen_out}

async def mm_node(state: TradingState):
    synth_output = state["synthesis_data"]
    entry = (synth_output["entry_plan"]["zone_low"] + synth_output["entry_plan"]["zone_high"]) / 2
    stop_loss = synth_output["stop_loss"]
    
    try:
        mm_out = money_agent.calculate(
            capital=state["capital"],
            risk_percent=state["risk_percent"],
            entry=entry,
            stop_loss=stop_loss,
            asset=state["asset"]
        )
    except ValueError:
        mm_out = {"error": "Invalid entry/stop loss"}
        
    return {"mm_data": mm_out}

async def reviewer_node(state: TradingState):
    synth_output = state["synthesis_data"]
    thesis_data = state["thesis_data"]
    scenarios_data = state["scenarios_data"]
    risk_data = state["risk_data"]
    mm_data = state["mm_data"]
    
    review_out = await reviewer_agent.review_plan(synth_output, thesis_data, risk_data, mm_data)
    
    plan = TradePlan(
        overall_bias=synth_output.get("overall_bias", "NEUTRAL"),
        confidence=synth_output.get("confidence", 0),
        signal_strength=synth_output.get("signal_strength", "WEAK"),
        trade_valid=synth_output.get("trade_valid", "NO"),
        reasoning=review_out.get("refined_reasoning", synth_output.get("reasoning", "")),
        thesis=thesis_data.get("thesis", ""),
        counter_thesis=thesis_data.get("counter_thesis", ""),
        entry_plan=synth_output.get("entry_plan", {"zone_low": 0, "zone_high": 0}),
        stop_loss=synth_output.get("stop_loss", 0),
        take_profit=mm_data.get("tp_levels", []),
        rr_ratio=mm_data.get("rr_ratio", 0),
        money_management=mm_data,
        scenarios=scenarios_data,
        risk_flags=synth_output.get("risk_flags", []) + risk_data.get("red_flags", []),
        sources={
            "technical": state["tech_data"], 
            "data": {"current_price": state["market_data"].get("current_price")},
            "news": state["news_data"],
            "sentiment": state["sentiment_data"],
            "macro": state["macro_data"],
            "risk": risk_data,
            "debate": state.get("debate_data"),
            "bull_debate": state.get("bull_data"),
            "bear_debate": state.get("bear_data")
        }
    )
    
    return {"final_plan": plan}

def build_parallel_graph():
    workflow = StateGraph(TradingState)
    
    # Add all nodes
    workflow.add_node("planner", planner_node)
    workflow.add_node("data", data_node)
    workflow.add_node("news", news_node)
    workflow.add_node("macro", macro_node)
    workflow.add_node("tech", tech_node)
    workflow.add_node("sentiment", sentiment_node)
    workflow.add_node("risk", risk_node)
    workflow.add_node("bull", bull_node)
    workflow.add_node("bear", bear_node)
    workflow.add_node("debate_moderator", debate_moderator_node)
    workflow.add_node("thesis", thesis_node)
    workflow.add_node("synthesizer", synthesizer_node)
    workflow.add_node("scenario", scenario_node)
    workflow.add_node("mm", mm_node)
    workflow.add_node("reviewer", reviewer_node)
    
    workflow.set_entry_point("planner")
    
    # Fan-out: planner -> data, news, macro (parallel)
    workflow.add_edge("planner", "data")
    workflow.add_edge("planner", "news")
    workflow.add_edge("planner", "macro")
    
    # Sequential after parallel
    workflow.add_edge("data", "tech")
    workflow.add_edge("news", "sentiment")
    
    # Fan-in: tech + sentiment + macro -> risk
    workflow.add_edge("tech", "risk")
    workflow.add_edge("sentiment", "risk")
    workflow.add_edge("macro", "risk")
    
    # Fan-out debate: risk -> bull, bear
    workflow.add_edge("risk", "bull")
    workflow.add_edge("risk", "bear")
    
    # Fan-in debate: bull + bear -> debate_moderator
    workflow.add_edge("bull", "debate_moderator")
    workflow.add_edge("bear", "debate_moderator")
    
    # Sequential pipeline after debate
    workflow.add_edge("debate_moderator", "thesis")
    workflow.add_edge("thesis", "synthesizer")
    workflow.add_edge("synthesizer", "scenario")
    workflow.add_edge("scenario", "mm")
    workflow.add_edge("mm", "reviewer")
    workflow.add_edge("reviewer", END)
    
    return workflow.compile()

trading_graph = build_parallel_graph()
