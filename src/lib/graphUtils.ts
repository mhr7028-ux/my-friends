import { Person, RelationshipEdge, RelationshipPathResult, PathStep } from './types';

/**
 * Finds the shortest relationship path between "나 (User)" and a target Person
 * using Breadth-First Search (BFS).
 */
export function findRelationshipPath(
  userId: string,
  targetId: string,
  people: Person[],
  edges: RelationshipEdge[]
): RelationshipPathResult | null {
  const user = people.find((p) => p.id === userId || p.isUser);
  const target = people.find((p) => p.id === targetId);

  if (!user || !target) return null;

  if (user.id === target.id) {
    return {
      targetPerson: target,
      degrees: 0,
      path: [{ person: user }],
      description: '본인(나)입니다.',
      commonFriends: [],
    };
  }

  // Build adjacency list (undirected graph representation)
  const adj = new Map<string, { to: string; edge: RelationshipEdge }[]>();
  people.forEach((p) => adj.set(p.id, []));

  edges.forEach((edge) => {
    adj.get(edge.sourceId)?.push({ to: edge.targetId, edge });
    // reverse edge for bidirectional graph traversal
    adj.get(edge.targetId)?.push({
      to: edge.sourceId,
      edge: {
        ...edge,
        sourceId: edge.targetId,
        targetId: edge.sourceId,
        label: getReverseRelationLabel(edge.label, edge.relationType),
      },
    });
  });

  // BFS Queue
  const queue: string[] = [user.id];
  const visited = new Set<string>([user.id]);
  const parentMap = new Map<string, { prevId: string; edge: RelationshipEdge }>();

  let found = false;

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (currentId === target.id) {
      found = true;
      break;
    }

    const neighbors = adj.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.to)) {
        visited.add(neighbor.to);
        parentMap.set(neighbor.to, { prevId: currentId, edge: neighbor.edge });
        queue.push(neighbor.to);
      }
    }
  }

  if (!found) {
    return {
      targetPerson: target,
      degrees: -1,
      path: [],
      description: `${user.name} 님과 ${target.name} 님 사이에 직접 등록된 인맥 고리가 없습니다. 새 관계를 추가해 보세요!`,
      commonFriends: [],
    };
  }

  // Reconstruct path from target back to user
  const path: PathStep[] = [];
  let curr = target.id;

  while (curr !== user.id) {
    const parentInfo = parentMap.get(curr)!;
    const person = people.find((p) => p.id === curr)!;
    path.unshift({ person, edgeToNext: parentInfo.edge });
    curr = parentInfo.prevId;
  }
  // Add user at the beginning of the path
  path.unshift({ person: user });

  // Calculate degrees (number of steps / edges)
  const degrees = path.length - 1;

  // Build human-readable path description
  const stepsText = path
    .slice(1)
    .map((step, idx) => {
      const prevPersonName = path[idx].person.name;
      const label = step.edgeToNext?.label || '인맥';
      return `'${prevPersonName}' 님의 ${label}인 [${step.person.name}]`;
    })
    .join(' ➔ ');

  const description = `${target.name} 님은 ${user.name} 님으로부터 총 ${degrees}단계 인맥 연결 고리입니다: ${stepsText}`;

  // Find common friends between user and target
  const userNeighbors = new Set((adj.get(user.id) || []).map((n) => n.to));
  const targetNeighbors = new Set((adj.get(target.id) || []).map((n) => n.to));
  const commonIds = Array.from(userNeighbors).filter((id) => targetNeighbors.has(id));
  const commonFriends = people.filter((p) => commonIds.includes(p.id));

  return {
    targetPerson: target,
    degrees,
    path,
    description,
    commonFriends,
  };
}

/**
 * Reverses kinship label (e.g. "소개자" ➔ "피소개자", "아들" ➔ "부모")
 */
function getReverseRelationLabel(label: string, relationType: string): string {
  if (label.includes('아들') || label.includes('딸')) return '부모';
  if (label.includes('부모') || label.includes('아버지') || label.includes('어머니')) return '자녀';
  if (label.includes('소개자')) return '피소개자';
  if (label.includes('남편')) return '아내';
  if (label.includes('아내')) return '남편';
  return label;
}
