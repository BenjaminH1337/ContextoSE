# 🧠 Semantic Engine Documentation

## Overview

The Contexto Svenska semantic engine uses a hierarchical category-based approach to calculate word similarity. This document explains the implementation, data sources, and algorithms used.

## Architecture

```
Input: Guess Word + Target Word
    ↓
1. Exact Match Check
    ↓ (if not exact)
2. Semantic Category Analysis
    ↓ (if no semantic match)
3. Orthographic Fallback (Levenshtein Distance)
    ↓
Output: Similarity Score (0.0 - 1.0) + Similarity Text
```

## Implementation Details

### 1. Exact Match Detection
- **Algorithm**: String equality comparison (case-insensitive)
- **Output**: Similarity = 1.0, Text = "Perfekt!"
- **Purpose**: Immediate win condition

### 2. Semantic Category Analysis

#### Category Hierarchy
The engine uses a predefined hierarchy of Swedish word categories:

```javascript
const categories = {
  'djur': {
    'husdjur': ['hund', 'katt', 'kanin', 'hamster'],
    'vilda_djur': ['björn', 'varg', 'räv', 'hare'],
    'fåglar': ['kråka', 'sparv', 'örn', 'uggla'],
    'fiskar': ['lax', 'torsk', 'sill', 'makrill'],
    'insekter': ['mygga', 'fluga', 'bin', 'geting']
  },
  'mat': {
    'frukt': ['äpple', 'päron', 'banan', 'apelsin'],
    'grönsaker': ['tomat', 'gurka', 'morot', 'potatis'],
    'kött': ['kött', 'fläsk', 'kyckling', 'lamm'],
    'dryck': ['vatten', 'mjölk', 'juice', 'kaffe']
  },
  'natur': {
    'väder': ['regn', 'snö', 'sol', 'moln'],
    'växter': ['träd', 'blomma', 'gräs', 'löv'],
    'landskap': ['berg', 'sjö', 'skog', 'strand']
  }
  // ... more categories
};
```

#### Strong Relations (0.9-1.0)
- **Same subcategory**: `hund` ↔ `katt` (both husdjur)
- **Direct synonyms**: `bil` ↔ `fordon`
- **Hypernyms**: `hund` ↔ `djur`

#### Weak Relations (0.6-0.8)
- **Same main category**: `hund` ↔ `björn` (both djur)
- **Related concepts**: `mat` ↔ `hunger`
- **Functional similarity**: `bil` ↔ `cykel` (both transport)

### 3. Orthographic Fallback

When no semantic relationship is found, the engine falls back to orthographic similarity:

#### Levenshtein Distance
- **Algorithm**: Dynamic programming edit distance
- **Formula**: `similarity = 1 - (distance / max(length1, length2))`
- **Range**: 0.1 - 0.5 (capped low to indicate semantic distance)

#### Common Letters Analysis
- **Algorithm**: Count shared characters (case-insensitive)
- **Weight**: 0.2 multiplier
- **Purpose**: Catch partial matches

#### Syllable Similarity
- **Algorithm**: Basic syllable counting and comparison
- **Weight**: 0.1 multiplier
- **Purpose**: Phonetic similarity hints

## Data Sources

### Swedish Word List
- **Source**: Curated list of ~2000 common Swedish words
- **Categories**: Manually categorized by semantic meaning
- **License**: Custom compilation (no external dependencies)
- **Coverage**: Common nouns, adjectives, and verbs

### Word Categories
- **Source**: Manual categorization based on Swedish language patterns
- **Methodology**: Native speaker validation
- **Updates**: Periodic expansion based on user feedback

## Similarity Metrics

### Score Ranges
- **1.0**: Exact match
- **0.9-0.99**: Strong semantic relation
- **0.6-0.89**: Moderate semantic relation
- **0.4-0.59**: Weak semantic relation
- **0.1-0.39**: Orthographic similarity only
- **0.0**: No similarity detected

### Similarity Text Mapping
```javascript
const similarityTexts = {
  1.0: 'Perfekt!',
  0.8: 'Väldigt nära!',
  0.6: 'Nära',
  0.4: 'Ganska nära',
  0.0: 'Långt borta'
};
```

## Performance Considerations

### Caching Strategy
- **Word validation**: In-memory Set lookup (O(1))
- **Category lookups**: Pre-computed hash maps
- **Similarity calculations**: No caching (computed on-demand)

### Computational Complexity
- **Exact match**: O(1)
- **Semantic analysis**: O(1) for category lookup
- **Levenshtein distance**: O(m×n) where m,n are word lengths
- **Overall**: O(1) average case, O(m×n) worst case

## Security Considerations

### Server-Side Execution
- **Rationale**: Prevent reverse engineering of similarity algorithm
- **Implementation**: All semantic logic runs on Express.js server
- **API**: RESTful endpoints with rate limiting

### Rate Limiting
- **Guesses per round**: 500 maximum
- **API calls per 15min**: 100 maximum
- **Purpose**: Prevent abuse and ensure fair gameplay

## Future Improvements

### Planned Enhancements
1. **Word Embeddings**: Integration with Swedish word2vec models
2. **Machine Learning**: Neural similarity scoring
3. **Dynamic Categories**: User-contributed category expansions
4. **Context Awareness**: Sentence-based similarity

### Data Expansion
1. **SAOL Integration**: Official Swedish Academy word list
2. **Frequency Weighting**: Common words get higher similarity scores
3. **Regional Variants**: Dialectal word variations

## Testing

### Unit Tests
- **Coverage**: All similarity calculation functions
- **Test Cases**: Edge cases, exact matches, semantic relations
- **Framework**: Vitest with comprehensive mocking

### Integration Tests
- **API Endpoints**: Full request/response cycle testing
- **Error Handling**: Invalid inputs, network failures
- **Performance**: Response time validation

## Monitoring

### Metrics Tracked
- **Response Times**: API endpoint performance
- **Error Rates**: Failed similarity calculations
- **Usage Patterns**: Most common word categories
- **User Feedback**: Similarity accuracy reports

### Alerting
- **High Error Rate**: >5% similarity calculation failures
- **Slow Response**: >500ms average response time
- **Rate Limit Hits**: Excessive API usage patterns

---

**Last Updated**: 2025-01-21  
**Version**: 1.0.0  
**Maintainer**: Benjamin Hawtin
