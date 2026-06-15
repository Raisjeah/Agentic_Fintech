FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/usr/local/bin" sh

COPY pyproject.toml ./

# Install python dependencies using uv
RUN uv pip install --system -r pyproject.toml || uv pip install --system pandas-ta numba fastapi uvicorn motor pydantic langgraph google-genai

COPY . .

ENV PYTHONPATH=/app

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
