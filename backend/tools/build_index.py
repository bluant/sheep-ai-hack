from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

def main():
    with open("knowledge.txt", encoding="utf-8") as f:
        text = f.read()

    chunks = [text[i:i+300] for i in range(0, len(text), 300)]
    docs = [Document(page_content=chunk) for chunk in chunks]

    embedder = OllamaEmbeddings(model="nomic-embed-text")
    db = FAISS.from_documents(docs, embedder)
    db.save_local("faiss_index")
    print(f"✅ Indexed {len(docs)} chunks from knowledge.txt")

if __name__ == "__main__":
    main()