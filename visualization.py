import matplotlib.pyplot as plt
import seaborn as sns
import io
from PIL import Image
import numpy as np

sns.set_style("whitegrid")
plt.style.use('default')

def plot_metrics(metrics):
    """Plot metrics as horizontal bar chart."""
    fig, ax = plt.subplots(figsize=(10, 6))
    metrics_list = list(metrics.items())
    y_pos = np.arange(len(metrics_list))
    ax.barh(y_pos, [v for _, v in metrics_list], color='skyblue')
    ax.set_yticks(y_pos)
    ax.set_yticklabels([k for k, _ in metrics_list])
    ax.set_xlabel('Value')
    ax.set_title('Financial Metrics')
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    img = Image.open(buf)
    plt.close()
    return img

def plot_expense_pie(expenses_breakdown):
    """Dynamic expense pie chart."""
    fig, ax = plt.subplots(figsize=(8, 8))
    sizes = list(expenses_breakdown.values())
    labels = list(expenses_breakdown.keys())
    colors = plt.cm.Set3(np.linspace(0, 1, len(labels)))
    wedges, texts, autotexts = ax.pie(sizes, labels=labels, autopct='%1.1f%%', 
                                      colors=colors, startangle=90)
    ax.set_title('Expense Breakdown')
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    img = Image.open(buf)
    plt.close()
    return img

def plot_sip_projection(years, fv_values):
    """SIP projection line chart."""
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(years, fv_values, marker='o', linewidth=3, markersize=8, color='green')
    ax.set_title('SIP Future Value Projection (12% annual return)')
    ax.set_xlabel('Years')
    ax.set_ylabel('Future Value (₹)')
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    buf.seek(0)
    img = Image.open(buf)
    plt.close()
    return img

